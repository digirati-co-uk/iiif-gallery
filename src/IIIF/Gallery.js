import Collection from './Collection';
import { Viewer } from 'OpenSeadragon';
import { fetch } from './Util';
import ImageQueue from './ImageQueue';

/**
 * IIIF Gallery.
 */
export default class Gallery extends Viewer {

  constructor(gallery, opts) {
    super(opts);

    this.wallImageWidth = opts.wallImageWidth || 100;
    this.wallImageSpacing = opts.wallImageSpacing || 15;
    this.wallOffsetTop = opts.wallOffsetTop || 200;
    this.wallOffsetLeft = opts.wallOffsetLeft || this.wallImageWidth/2;
    this.resolveVideo = opts.resolveVideo || this.resolveVideo;
    this.resolveManifestImages = opts.resolveManifestImages || this.resolveManifestImages;

    this.wallImages = [];

    this.queue = this.configureImageQueue();

    // this.backgroundWallImage = 'https://dlcs.io/iiif-img/4/4/f72a98a7_blank_gallery_wall.jpg/info.json';
    // this.backgroundWallWidth = 1000;
    // this.backgroundWallImages = [];

    // Make wall (unable to do it after images).
    this.makeWall(5, -250);

    // Fetch the gallery.
    this.fetchGallery(gallery);
  }

  configureImageQueue() {
    return new ImageQueue((meta, k) => {
      switch (meta.type) {
        case 'image':
          this.appendWallImage(meta.image, k);
          break;

        case 'video':
          this.appendWallVideo(meta.video, k);
          break;
      }
    });
  }

  appendWallVideo(video, k) {
    return this.addOverlay({
      element: video,
      location: new OpenSeadragon.Rect(
          this.wallOffsetLeft + (k*(this.wallImageWidth+this.wallImageSpacing)),
          this.wallOffsetTop,
          this.wallImageWidth,
          this.wallImageWidth
      )
    });
  }

  //resolveVideo(/*Manifest*/ manifest) {
  //  console.log(manifest);
  //}

  //playVideo() {
  //  var elt = document.querySelector("#video");
  //  // (1): location: new OpenSeadragon.Rect(140, 150, 280, 200)
  //  // (2): location: new OpenSeadragon.Rect(520, 150, 280, 200)
  //  // Delta: 380
  //  // Width: 280
  //  // Gap: 100
  //  // Spacing: 50?
  //  this.addOverlay({
  //    element: elt,
  //    location: new OpenSeadragon.Rect(520, 150, this.wallImageWidth, this.wallImageWidth)
  //  });
  //}

  /**
   * Fetches gallery from input URL.
   * @param gallery
   * @returns {Promise.<T>}
   */
  fetchGallery(gallery) {
    return fetch(gallery).then((d) => {
      // Map to collection.
      return new Collection(d);
    }).then((manifest) => {
      // Add images to wall in order.
      this.resolveManifestImages(manifest).map((image, k) => {
        if (k === 2) this.queue.push({ type: 'video', video: document.querySelector("#video") }).flush();
          this.queue.push({ type: 'image', image, manifest });
      });
      this.queue.flush();
    });
  }

  resolveManifestImages(manifest) {
    return manifest.images;
  }

  /**
   * addTiledImage wrapped in promise.
   * @param opts
   * @returns {Promise}
   */
  asyncAddTiledImage(opts) {
    return new Promise((resolve, err) => {
      opts.success = resolve;
      try {
        this.addTiledImage(opts);
      } catch (e) {
        err(e)
      }
    });
  }

  /**
   * Appends image to the wall, spaced using key.
   *
   * @todo add replacing mechanism for already existing images.
   * @param image
   * @param k
   * @returns {Promise}
   */
  appendWallImage(image, k) {
    return this.asyncAddTiledImage({
      tileSource: image,
      width: this.wallImageWidth,
      y: this.wallOffsetTop,
      x: this.wallOffsetLeft + (k*(this.wallImageWidth+this.wallImageSpacing))
    });
  }


  /**
   * Unused due to layering issues.
   * @param num
   * @param offset
   */
  makeWall(num, offset = 0) {
    while (num-- > 0) {
      this.addTiledImage({
        tileSource: 'https://dlcs.io/iiif-img/4/4/f72a98a7_blank_gallery_wall.jpg/info.json',
        width: 1000,
        x: num*1000+offset,
        y: 0
      });
    }
  }
}

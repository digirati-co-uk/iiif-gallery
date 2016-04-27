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
    this.resolveCollectionImages = opts.resolveCollectionImages || this.resolveCollectionImages;

    this.wallImages = [];

    this.queue = this.configureImageQueue();
    this.queue.onFlushEnd = this.recalculateWall.bind(this);

     this.backgroundWallImage = 'https://dlcs.io/iiif-img/4/4/f72a98a7_blank_gallery_wall.jpg/info.json';
     this.backgroundWallWidth = 1000;

    // Make wall (unable to do it after images).
    this.recalculateWall();

    // Fetch the gallery.
    this.fetchGallery(gallery);
  }

  configureImageQueue() {
    return new ImageQueue((meta, k) => {
      switch (meta.type) {
        case 'image':
          this.appendWallImage(meta.image, k, k+100);
          break;

        case 'video':
          this.appendWallVideo(meta.video, k, k+100);
          break;
      }
    });
  }

  appendWallVideo(video, key, index) {
    return this.addOverlay({
      element: video,
      location: new OpenSeadragon.Rect(
          this.wallOffsetLeft + (key*(this.wallImageWidth+this.wallImageSpacing)),
          this.wallOffsetTop,
          this.wallImageWidth,
          this.wallImageWidth
      )
    });
  }

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
      this.resolveCollectionImages(manifest).map((image, k) => {
        this.queue.push({ type: 'image', image, manifest });
      });
      this.queue.flush();
    });
  }

  /**
   * Get array of image manifests from collection.
   *
   * @param collection
   * @returns {*|HTMLCollection}
   */
  resolveCollectionImages(collection) {
    return collection.images;
  }

  /**
   * addTiledImage wrapped in promise.
   * @returns {Promise}
   */
  asyncAddTiledImage(...args) {
    return new Promise((resolve, err) => {
      if (args[0]) {
        args[0].success = resolve;
      }
      try {
        this.addTiledImage.apply(this, args);
      } catch (e) {
        err(e)
      }
    });
  }

  /**
   * Appends image to the wall, spaced using key.
   *
   * @todo add replacing mechanism for already existing images.
   *
   * @param image
   * @param key
   * @param index
   * @param replace
   * @returns {Promise}
   */
  appendWallImage(image, key, index, replace=false) {
    return this.asyncAddTiledImage({
      tileSource: image,
      width: this.wallImageWidth,
      replace,
      index,
      y: this.wallOffsetTop,
      x: this.wallOffsetLeft + (key*(this.wallImageWidth+this.wallImageSpacing))
    });
  }

  recalculateWall(images) {
    let image_count = images? images.length : 0;
    let wallWidth = this.wallOffsetLeft + ((image_count+1)* (this.wallImageWidth+this.wallImageSpacing));
    let wallPanelCount = Math.ceil(wallWidth / this.backgroundWallWidth);

    this.makeWall(wallPanelCount, -this.wallOffsetTop);
  }


  /**
   * Unused due to layering issues.
   *
   * @param num
   * @param offset
   */
  makeWall(num, offset = 0) {
    while (num-- > 0) {
      this.addTiledImage({
        tileSource: this.backgroundWallImage,
        width: this.backgroundWallWidth,
        index: num,
        x: num*this.backgroundWallWidth+offset,
        y: 0
      });
    }
  }
}

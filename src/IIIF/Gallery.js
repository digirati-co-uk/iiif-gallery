import Collection from './Collection';
import { Viewer } from 'OpenSeadragon';
import { fetch } from './Util';

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
    this.wallImages = [];

    // this.backgroundWallImage = 'https://dlcs.io/iiif-img/4/4/f72a98a7_blank_gallery_wall.jpg/info.json';
    // this.backgroundWallWidth = 1000;
    // this.backgroundWallImages = [];

    // Make wall (unable to do it after images).
    this.makeWall(5, -250);
    // Fetch the gallery.
    this.fetchGallery(gallery);
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
      manifest.images.map((e, k) => {
        this.appendWallImage(e, k);
      })
    });
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
    this.wallImages[k] = image;
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

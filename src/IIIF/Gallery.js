import Collection from './Collection';
import { Viewer } from 'OpenSeadragon';
import { fetch } from './Util';
import ImageQueue from './ImageQueue';


/**
 * IIIF Gallery.
 */
export default class Gallery extends Viewer {

  /**
   * Gallery constructor
   *
   * Takes in an options array that is an extension of OSD.
   * Can be used as OSD viewer without using any of the extensions.
   *
   * @param opts
   */
  constructor(opts) {
    super(opts);
    // Default configuration.
    this.wallImageWidth = opts.wallImageWidth || 100;
    this.wallImageSpacing = opts.wallImageSpacing || 15;
    this.wallOffsetTop = opts.wallOffsetTop || 200;
    this.wallOffsetLeft = opts.wallOffsetLeft || this.wallImageWidth/2;
    this.resolveVideo = opts.resolveVideo || this.resolveVideo;
    this.resolveCollectionImages = opts.resolveCollectionImages || this.resolveCollectionImages;
    this.backgroundWallImage = opts.backgroundWallImage || 'https://dlcs.io/iiif-img/4/4/f72a98a7_blank_gallery_wall.jpg/info.json';
    this.backgroundWallWidth = opts.backgroundWallWidth || 1000;
    let gallery = opts.gallery || null;

    // Creates an image queue, with hooks into OSD specifics.
    this.configureImageQueue();

    // Default media types.
    this.mediaTypes = {
      'image': this.appendWallImage,
      'html': this.appendWallHtml
    };

    // Build a gallery from passed in information.
    if (gallery) {
      // If we have a string, assume the default URL of IIIF collection.
      if (typeof gallery === 'string') {
        gallery = IIIFCollectionResolver(gallery);
      }
      // We should now have a promise that will return an array of actions
      // that we can pass to our queue (and flush to display them)
      gallery.then((actions) => {
        this.queue.pushAll(actions).flush()
      });
    }
  }

  /**
   * Adds new media type.
   *
   * @param type string Used to identify type when passing an action.
   * @param reducer function This will render the media onto the canvas (see appendWallImage + appendWallVideo)
   */
  addMediaType(type, reducer) {
    this.mediaTypes[type] = reducer.bind(this)
  }

  /**
   * Configures image queue using our media types.
   */
  configureImageQueue() {
    this.queue = new ImageQueue((meta, k) => {
      if (this.mediaTypes[meta.type]) {
        this.mediaTypes[meta.type].apply(this, [ meta.payload, k, k+100 ])
      }
      else {
        throw Error("Unsupported media type");
      }
    });
    // This is allows overlays to be re-rendered
    this.queue.beforeFlushStart = () => {
      this.clearOverlays();
      this.overlaysContainer.innerHTML = "";
    };
    // This will auto stretch the wall to fit the content.
    this.queue.onFlushEnd = this.recalculateWall.bind(this);
  }

  /**
   * HTML media type reducer.
   *
   * This will append an HTML element on the wall with the correct spacing.
   *
   * @param payload
   * @param key
   * @param index
   * @returns {*|OpenSeadragon.Viewer}
   */
  appendWallHtml(payload, key, index) {
    return this.addOverlay({
      element: payload.element,
      location: new OpenSeadragon.Rect(
          this.wallOffsetLeft + (key*(this.wallImageWidth+this.wallImageSpacing)),
          this.wallOffsetTop,
          this.wallImageWidth,
          this.wallImageWidth
      )
    });
  }

  /**
   * Image media type reducer.
   *
   * Appends image to the wall, spaced correctly.
   *
   * @param image
   * @param key
   * @param index
   * @param replace
   * @returns {Promise}
   */
  appendWallImage({ image }, key, index, replace=false) {
    return this.asyncAddTiledImage({
      tileSource: image,
      width: this.wallImageWidth,
      replace,
      index,
      y: this.wallOffsetTop,
      x: this.wallOffsetLeft + (key*(this.wallImageWidth+this.wallImageSpacing))
    });
  }

  /**
   * addTiledImage wrapped in promise.
   *
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
   * Recalculates the walls width and adds tiles accordingly.
   *
   * @param images
   */
  recalculateWall(images) {
    let image_count = images? images.length : 0;
    let wallWidth = this.wallOffsetLeft + ((image_count+1)* (this.wallImageWidth+this.wallImageSpacing));
    let wallPanelCount = Math.ceil(wallWidth / this.backgroundWallWidth);

    this.makeWall(wallPanelCount, -this.wallOffsetTop);
  }


  /**
   * Creates segment X of the wall.
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

/**
 * Default resolver for IIIF Collection.
 *
 * @param url
 * @returns {Promise.<T>}
 */
export function IIIFCollectionResolver(url) {
  return fetch(url).then((d) => {
    // Map to collection.
    return new Collection(d);
  }).then((manifest) => {
    // Add images to wall in order.
    return manifest.images.map((image, key) => {
      return { type: 'image', payload: { image, manifest, key }};
    });
  });
}

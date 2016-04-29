import Collection from './Collection';
import { Viewer } from 'OpenSeadragon';
import $ from 'OpenSeadragon';
import { fetch } from './Util';
import ImageQueue from './ImageQueue';
import Velocity from 'velocity-animate';

const throttle = function(fn, delay) {
  return function() {
    var now = (new Date).getTime()
    if (!fn.lastExecuted || fn.lastExecuted + delay < now) {
      fn.lastExecuted = now
      fn.apply(fn, arguments)
    }
  }
}

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
    this.show3DFloor = opts.show3DFloor || false;
    this._3dfloor = [];
    let collection = opts.collection || null;

    // Creates an image queue, with hooks into OSD specifics.
    this.configureImageQueue();

    // Default media types.
    this.mediaTypes = {
      'image': this.appendWallImage,
      'html': this.appendWallHtml
    };

    // Build a gallery from passed in information.
    if (collection) {
      this.resolve(collection);
    }

    this.recalculateWall([]);


  }

  /**
   * Public access to push images onto the queue.
   *
   * @param images
   * @param flush
   */
  push(images, flush = true) {
    // make sure we have an array.
    images = ($.isArray(images)) ? images : [images];
    // Add them to the queue.
    this.queue.pushAll(images);
    if (flush) {
      this.queue.flush();
    }
  }

  /**
   * Renders a
   * @param collection string|Promise
   */
  resolve(collection) {
    // If we have a string, assume the default URL of IIIF collection.
    if (typeof collection === 'string') {
      collection = IIIFCollectionResolver(collection);
    }
    // We should now have a promise that will return an array of actions
    // that we can pass to our queue (and flush to display them)
    collection.then((actions) => {
      this.push(actions)
    });
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
   * Creates 3D wall given a width with events and caching.
   *
   * @param wallWidth
   * @returns Element
   */
  create3DFloor(wallWidth) {
    if (this._3dfloor[wallWidth]) return this._3dfloor[wallWidth];

    let floor = document.createElement('div');
    floor.setAttribute('id', 'floor');
    floor.setAttribute('class', 'floor');

    let calculatePan = throttle((x) => {
      Velocity(floor, { transformOriginY: 'top', transformOriginX: ((x) / (wallWidth) *100)+'%' }, {duration: 8});
    }, (1000/60));

    let calculateZoom = throttle((e) => {
      //if (this.viewport.getZoom(true) > 0.0013) {
      //  Velocity(floor, { opacity: 0 }, {duration: 0});
      //}
      //else {
      //  Velocity(floor, { opacity: 1 }, {duration: 0});
      //}
      Velocity(floor, {
        opacity: this.viewport.getZoom(true) > 0.0013 ? 0 : 1
      }, {duration: 0});
      calculatePan(this.viewport.getCenter().x);
    }, (1000/60));

    this.addHandler('pan', (e) => calculatePan(e.center.x));
    this.addHandler('add-overlay', (e) => calculatePan(this.viewport.getCenter().x));
    this.addHandler('zoom', calculateZoom);
    return this._3dfloor[wallWidth] = floor;
  }

  /**
   * Adds 3D floor to canvas given wall width
   *
   * @param wallWidth
   * @param height
   */
  add3DFloor(wallWidth, height=250) {
    this.addOverlay({
      element: this.create3DFloor(wallWidth),
      location: new OpenSeadragon.Rect(
          0,
          window.innerHeight-height,
          wallWidth-80,
          height
      )
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
    if (this.show3DFloor) {
      this.add3DFloor(wallWidth);
    }
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
        x: num*this.backgroundWallWidth,
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
  }).then((collection) => {
    // Add images to wall in order.
    return collection.images.map((image, key) => {
      return { type: 'image', payload: { image, collection, key }};
    });
  });
}

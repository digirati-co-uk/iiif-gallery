import Collection from './Collection';
import { Viewer } from 'OpenSeadragon';
import $ from 'OpenSeadragon';
import { fetch, throttle, memoize } from './Util';
import ImageQueue from './ImageQueue';
import Velocity from 'velocity-animate';


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
    // Change some default options.
    opts.visibilityRatio = opts.visibilityRatio ? opts.visibilityRatio : 1;
    opts.homeFillsViewer = opts.homeFillsViewer ? opts.homeFillsViewer : true;
    opts.constrainDuringPan = opts.constrainDuringPan ? opts.constrainDuringPan : true;
    opts.prefixUrl = opts.prefixUrl ? opts.prefixUrl : 'images/';
    opts.animationTime = opts.animationTime ? opts.animationTime : 0.3;
    opts.minZoomLevel = opts.minZoomLevel ? opts.minZoomLevel : 0.0007;
    opts.show3DFloor = opts.show3DFloor ? opts.show3DFloor : true;
    opts.springStiffness = opts.springStiffness ? opts.springStiffness : 100;
    // Pass to OSD constructor.
    super(opts);
    // Custom configuration.
    this.wallImageWidth = opts.wallImageWidth || 300;
    this.wallImageSpacing = opts.wallImageSpacing || 150;
    this.wallOffsetTop = opts.wallOffsetTop || 120;
    this.wallOffsetLeft = opts.wallOffsetLeft || this.wallImageWidth/2;
    this.resolveVideo = opts.resolveVideo || this.resolveVideo;
    this.resolveCollectionImages = opts.resolveCollectionImages || this.resolveCollectionImages;
    this.backgroundWallImage = opts.backgroundWallImage || 'http://dlcs.io/iiif-img/4/4/7ade194e-2bed-4b0d-afd0-939bca603cba/info.json';
    this.backgroundWallWidth = opts.backgroundWallWidth || 1500;
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

    // Blur before items are on the wall.
    this.blurGallery();

    // Build a gallery from passed in information.
    if (collection) {
      this.resolve(collection);
    }

    // Recalculate wall size.
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
   * @return Promise
   */
  resolve(collection) {
    // If we have a string, assume the default URL of IIIF collection.
    if (typeof collection === 'string') {
      collection = IIIFCollectionResolver(collection);
    }
    // We should now have a promise that will return an array of actions
    // that we can pass to our queue (and flush to display them)
    return collection.then((actions) => {
      this.push(actions);
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
      this.blurGallery();
      this.overlaysContainer.innerHTML = "";
    };
    // This will auto stretch the wall to fit the content.
    this.queue.onFlushEnd = (images) => {
      this.recalculateWall(images).then(() => this.focusGallery());
    }
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
    return Promise.resolve(this.addOverlay({
      element: payload.element,
      location: new OpenSeadragon.Rect(
          this.wallOffsetLeft + (key*(this.wallImageWidth+this.wallImageSpacing)),
          this.wallOffsetTop,
          this.wallImageWidth,
          this.wallImageWidth
      )
    }));
  }

  /**
   * Image media type reducer.
   *
   * Appends image to the wall, spaced correctly.
   * {
   *    @param image
   *    @param height
   *    @param width
   * }
   * @param key
   * @param index
   * @param replace
   * @returns {Promise}
   */
  appendWallImage({ image, height, width }, key, index, replace=true) {
    let options = {
      tileSource: image,
      width: this.wallImageWidth,
      index,
      y: this.wallOffsetTop,
      x: this.wallOffsetLeft + (key*(this.wallImageWidth+this.wallImageSpacing))
    };
    if (height && width) {
      let ratio = height/width;
      let predicted_height = this.wallImageWidth*ratio;
      if (predicted_height > this.wallImageWidth) {
        // Adjusted width
        options.width = this.wallImageWidth*(this.wallImageWidth/predicted_height);
      }
      // Recalculate spacing.
      if(options.width - this.wallImageWidth !== 0) {
        options.x += (this.wallImageWidth - options.width)/2;
      }
      if(predicted_height - this.wallImageWidth < 0) {
        options.y += (this.wallImageWidth - predicted_height)/2;
      }
    }
    return this.asyncAddTiledImage(options);
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
   * Clears the canvas of all tiles (optional replacement)
   * @param replacement
   */
  resetAllTiles(replacement) {
    this.blurGallery();
    this.world.removeAll();
    this.recalculateWall([]);
    this.queue.reset();
    if (replacement) {
      this.resolve(replacement);
    }
  }

  /**
   * Blurs gallery.
   */
  blurGallery() {
    Velocity(this.element, {blur: 15}, {duration: 200 });
  }

  /**
   * Focuses gallery.
   */
  focusGallery() {
    Velocity(this.element, {blur: 0}, {duration: 800 });
  }

  /**
   * Creates 3D wall given a width with events and caching.
   *
   * @param wallWidth
   * @returns Element
   */
  create3DFloor(wallWidth) {

    let floor = document.createElement('div');
    floor.setAttribute('id', 'floor');
    floor.setAttribute('class', 'floor');

    let calculatePan = throttle((x) => {
      floor.style.transformOrigin = ((x) / (wallWidth) *100)+'% 0%';
      // Calculate the perspective origin to be center of the screen (x) as a pecentage of wall width.
      //Velocity(floor, { transformOriginY: 'top', transformOriginX: ((x) / (wallWidth) *100)+'%' }, {duration: 0});
    }, (1000/60));

    let calculateZoom = throttle((e) => {
      //// Hide and show at further zoom levels (perf).
      Velocity(floor, {
        opacity: this.viewport.getZoom(true) > 0.0013 ? 0 : 1
      }, {duration: 0});
      // Recalculate width.
      calculatePan(this.viewport.centerSpringX.current.value);
    }, (1000/60));

    this.addHandler('pan', (e) => calculatePan(e.center.x));
    this.addHandler('viewport-change', (e) => calculatePan(this.viewport.centerSpringX.current.value));
    this.addHandler('add-overlay', (e) => {
      if (floor.offsetWidth/floor.offsetHeight > 1) {
        // Set background size ratio.
        Velocity(floor, { backgroundSize: 30/(wallWidth/950)+'%' }, { duration: 0 });
        // Recalculate floor width.
        calculatePan(this.viewport.centerSpringX.current.value)
      }
    });
    this.addHandler('zoom', calculateZoom);
    return floor;
  }

  /**
   * Adds 3D floor to canvas given wall width
   *
   * @param wallWidth
   * @param height
   */
  add3DFloor(wallWidth, height=300) {
    return Promise.resolve(this.addOverlay({
      element: this.create3DFloor(wallWidth),
      location: new OpenSeadragon.Rect(
          0,
          580,
          wallWidth,
          height
      )
    }));
  }

  /**
   * Recalculates the walls width and adds tiles accordingly.
   *
   * @param images
   */
  recalculateWall(images) {
    let image_count = images? images.length : 0;
    let wallWidth = this.wallOffsetLeft + ((image_count)* (this.wallImageWidth+this.wallImageSpacing));
    let wallPanelCount = Math.ceil(wallWidth / this.backgroundWallWidth);
    return Promise.all([
      this.makeWall(wallPanelCount, -this.wallOffsetTop),
      this.show3DFloor ? this.add3DFloor(wallWidth) : () => {}
    ]);
  }


  /**
   * Creates segment X of the wall.
   *
   * @param num
   * @param offset
   */
  makeWall(num, offset = 0) {
    let promises = [];
    while (num-- > 0) {
      promises.push(this.asyncAddTiledImage({
        tileSource: this.backgroundWallImage,
        width: this.backgroundWallWidth,
        index: num,
        x: num*this.backgroundWallWidth,
        y: 0
      }));
    }
    return Promise.all(promises);
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
    return Promise.all(collection.images.map((image, key) => {
      // Make network request for each image
      return fetch(image).then((resp) => {
        console.log(resp);
        // Return the image with extra attributes.
        return { type: 'image', payload: {
          image,
          collection,
          key,
          height: resp.height,
          width: resp.width,
          source: resp
        }};
      })
    }));
  });
}

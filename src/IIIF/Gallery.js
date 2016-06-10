import Collection from './Collection';
import { Viewer } from 'OpenSeadragon';
import $ from 'OpenSeadragon';
import { fetch, throttle, memoize, getCanvasLines, withContext } from './Util';
import ImageQueue from './ImageQueue';
import { LabelElement } from './Label';
import Velocity from 'velocity-animate';
import { IIIFCollectionResolver } from './Resolver'


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
    opts.crossOriginPolicy = opts.crossOriginPolicy ? opts.crossOriginPolicy : 'Anonymous';
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
    this.labelLinkEnabled = opts.labelLinkEnabled || false;
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
      if (!meta) return;
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
   *    @param label
   *    @param related
   * }
   * @param key
   * @param index
   * @param replace
   * @returns {Promise}
   */
  appendWallImage({ image, height, width, label, related }, key, index, replace=true) {
    let options = {
      tileSource: image,
      width: this.wallImageWidth,
      index,
      y: this.wallOffsetTop,
      x: this.wallOffsetLeft + (key*(this.wallImageWidth+this.wallImageSpacing))
    };
    let resolvables = [];
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
      if (label) {
        let label_width = 60*0.75;
        let label_height = 40*0.75;
        // For position bottom.
        //let label_offset_left = (options.x + (options.width/2)) - (label_width/2);
        //let label_offset_top = options.y+(options.width*ratio)+40;
        // For position left.
        let label_offset_left = (options.x  - (label_width) - /*spacing*/ 10);
        let label_offset_top = options.y+(options.width*ratio) - label_height;

        resolvables.push(
          this.createLabelElement(label, label_height, label_width, related)
              .then(($label) => {
                this.asyncAddOverlay({
                  element: $label,
                  location: new OpenSeadragon.Rect(
                    label_offset_left,
                    label_offset_top,
                    label_width,
                    label_height
                  )
                });
          })
        )
      }
    }
    resolvables.push(
      this.asyncAddTiledImage(options)
    );

    return Promise.all(resolvables);
  }

  /**
   * Creates HTML overlay given a label and dimensions.
   *
   * @param label
   * @param height
   * @param width
   * @param related
   * @returns {*|Promise.<T>}
   */
  createLabelElement(label, height, width, related) {
      return LabelElement({
        label,
        height,
        width,
        imagePath: './images/label.png'
      }).then((ctx) => {
        // Export to PNG.
        let label_url = ctx.toDataURL();
        let $container;

        if (related && this.labelLinkEnabled) {
          $container = document.createElement('a');
          $container.href = related;
          $container.setAttribute('target', '_blank');
          $container.onclick = (e) => {
            if (e.quick) return;
            var evt = e ? e:window.event;
            if (evt.stopPropagation)    evt.stopPropagation();
            //noinspection JSValidateTypes
            if (evt.cancelBubble !== null) evt.cancelBubble = true;
          };
          $container.setAttribute('style', 'display: block;')
        }
        else {
          $container = document.createElement('div');
        }
        //$container.className = 'imageContainer';
        // Create image
        let $label = document.createElement('img');
        $label.src = label_url;
        $label.setAttribute('style', 'width:100%;');
        // Add to container
        $container.appendChild($label);
        // Return container.
        return $container;
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
   * Promise wrapper for adding an overlay.
   * @param args
   * @returns {Promise.<*|OpenSeadragon.Viewer>}
   */
  asyncAddOverlay(...args) {
    return Promise.resolve(this.addOverlay.apply(this, args));
  }

  /**
   * Clears the canvas of all tiles (optional replacement)
   * @param replacement
   */
  resetAllTiles(replacement) {
    this.blurGallery();
    this.world.removeAll();
    this.queue.reset();
    this.recalculateWall([]);
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
    let floorWrapper = document.createElement('div');
    floorWrapper.setAttribute('style',
        '-webkit-transform: translate3d(0, 0, 0);' +
        '-moz-transform: translate3d(0, 0, 0);' +
        '-ms-transform: translate3d(0, 0, 0);' +
        'transform: translate3d(0, 0, 0);'
    );
    let floor = document.createElement('div');
    floor.setAttribute('id', 'floor');
    //floor.setAttribute('class', 'floor');
    let background = 'http://allroundnews.com/wp-content/uploads/2012/10/seamless-white-wood-textures.jpg';
    floor.setAttribute('style',
        'background-image:url(' + background + ');' +
        'background-repeat:repeat-x;' +
        'width: 100%;' +
        'height: 100%;' +
        'transform:matrix3d(1,0,0.00,0,0.00,0.3,0.94,-0.001,0,-0.94,0.34,0,0,0,0,1)');

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

    let trimWallRight = (e) => {
      if (wallWidth < 1000 || e.immediately) return;
      let bounds = this.viewport.getBounds();
      if ((bounds.x + bounds.width) > wallWidth) {
        this.viewport.centerSpringX.resetTo(wallWidth - (bounds.width/2));
      }
    };
    this.addHandler('viewport-change', trimWallRight);
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
    floorWrapper.appendChild(floor);
    return floorWrapper;
  }

  /**
   * Adds 3D floor to canvas given wall width
   *
   * @param wallWidth
   * @param height
   */
  add3DFloor(wallWidth, height=300) {
    return this.asyncAddOverlay({
      element: this.create3DFloor(wallWidth),
      location: new OpenSeadragon.Rect(
          0,
          580,
          wallWidth,
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
        clip: OpenSeadragon.Rect(0, 100, this.backgroundWallWidth, this.backgroundWallWidth),
        x: num*this.backgroundWallWidth,
        y: 0
      }));
    }
    return Promise.all(promises);
  }
}

export function createImageAction(image, height, width, key=null, collection=null, related=null, label=null, source=null) {
  return {
    type: 'image', payload: {
      image,
      collection,
      key,
      related,
      label,
      height,
      width,
      source
    }
  };
}


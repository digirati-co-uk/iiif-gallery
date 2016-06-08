import IIIFBase from './IIIFBase';
import { mapArrayOf, uid } from './Util';
import Canvas from './Canvas';

/**
 * sc:Sequence
 */
export default class Sequence extends IIIFBase {

  constructor(args) {
    super(args);
    this.canvases = mapArrayOf(Canvas, this.canvases);
  }

  /**
   * Get first image from each canvas generator.
   *
   * Each iteration returns meta data for an image in the canvas.
   *
   * @param defaults
   */
  *getImages(defaults = {}) {
    for (let canvas of this.canvases) {
      let image = canvas.getFirstImage();
      if (image) {
        yield Object.assign({}, defaults, {
          image,
          key: uid(),
          height: canvas.height,
          width: canvas.width,
          label: canvas.label ? canvas.label : defaults.label
        });
      }
    }
  }

}

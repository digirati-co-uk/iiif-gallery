import IIIFBase from './IIIFBase';
import { mapArrayOf } from './Util';
import { _ } from 'lodash';

/**
 * sc:Canvas
 */
export default class Canvas extends IIIFBase {

  constructor(args) {
    super(args);
  }

  getFirstImage() {
    if (
        !this.images[0] ||
        !this.images[0].resource ||
        !this.images[0].resource.service ||
        !this.images[0].resource.service['@id']
    ) {
      return null;
    }
    return this.images[0].resource.service['@id']+ '/info.json';
  }

}


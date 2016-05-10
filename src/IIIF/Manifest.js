import assert from 'assert';
import { mapArrayOf } from './Util';
import IIIFBase from './IIIFBase';
import Sequence from './Sequence';

/**
 * sc:Manifest
 */
export default class Manifest extends IIIFBase {
  /* These prevent IDE warnings, can be removed. */
  /** @namespace this.related */
  /** @namespace this.thumbnail.service */
  /** @namespace this.thumbnail */

  constructor(data) {
    // Run assertions.
    assert.strictEqual(data['@type'], 'sc:Manifest');
    // Apply the data to self.
    super(data);
    // Map some children.
    this.sequences = mapArrayOf(Sequence, this.sequences);
  }

  /**
   * Returns link to sc:Sequence
   * @returns {string}
   */
  getImageSource() {
    if (this.thumbnail && this.thumbnail.service) {
      return this.thumbnail.service['@id'] + '/info.json'
    }
    else {
      throw "Thumbnail service not found on collection";
    }
  }

  getRelatedItem() {
    if (this.related && this.related['format'] === 'text/html') {
      return this.related['@id'];
    }
  }

}

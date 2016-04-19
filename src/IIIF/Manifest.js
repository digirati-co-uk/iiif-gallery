import assert from 'assert';
import { mapArrayOf } from './Util';
import IIIFBase from './IIIFBase';
import Sequence from './Sequence';

/**
 * sc:Manifest
 */
export default class Manifest extends IIIFBase {

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
    return this.thumbnail.service['@id'] + '/info.json'
  }

}

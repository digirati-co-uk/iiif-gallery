import OpenSeadragon from 'OpenSeadragon';

/**
 * Base method for sc:*
 */
export default class IIIFBase {

  constructor(data) {
    // Maps passed in object to itself.
    this.mapFrom(data);
  }

  id() {
    return this.getProp('@id');
  }

  getProp(prop) {
    return this[prop];
  }

  mapFrom(data) {
    OpenSeadragon.extend(this, data);
  }
}

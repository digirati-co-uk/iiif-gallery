import { mapArrayOf } from './Util';
import IIIFBase from './IIIFBase';
import Manifest from './Manifest';

export default class Collection extends IIIFBase {

  constructor(data) {
    // Apply the data to self.
    super(data);
    // Get manifest.
    this.manifests = mapArrayOf(Manifest, this.manifests);
    // Get images from manifest.
    this.images = this.manifests.map(manifest => manifest.getImageSource());
  }

}

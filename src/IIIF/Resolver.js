import Collection from './Collection';
import Manifest from './Manifest';
import { fetch } from './Util';

export function ManifestFromCollection(collection) {
  console.info(collection);
  // Add images to wall in order.
  return Promise.all(collection.manifests.map((manifest, key) => {
    let image = manifest.getImageSource();
    // Make network request for each image
    return fetch(image).then((resp) => {
      // Return the image with extra attributes.
      return { type: 'image', payload: {
        image,
        collection,
        key,
        related: manifest.getRelatedItem(),
        label: manifest.label,
        height: resp.height,
        width: resp.width,
        source: resp
      }};
    })
  }));
}

export function payloadFromManifest(manifest, key = null, collection = {}) {
  let image = manifest.getImageSource();
  // Make network request for each image
  return fetch(image).then((resp) => {
    // Return the image with extra attributes.
    return { type: 'image', payload: {
      image,
      collection,
      key,
      related: manifest.getRelatedItem(),
      label: manifest.label,
      height: resp.height,
      width: resp.width,
      source: resp
    }};
  })
}


/**
 * Default resolver for IIIF Collection.
 *
 * @param url
 * @returns {Promise.<T>}
 */
export function IIIFCollectionResolver(url) {
  return fetch(url).then((abstractType) => {

    if (abstractType['@type'] === 'sc:Manifest') {
      // We have a manifest.
      return Promise.all([ payloadFromManifest(new Manifest(abstractType)) ]);
    }

    // Map to collection.
    return ManifestFromCollection(new Collection(abstractType));
  });
}

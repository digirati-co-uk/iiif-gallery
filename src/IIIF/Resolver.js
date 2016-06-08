import Collection from './Collection';
import Manifest from './Manifest';
import { fetch, take } from './Util';

/**
 * Returns images extracted from collection.
 *
 * @param collection
 * @returns {Promise}
 */
export function payloadsFromCollection(collection) {
  // Add images to wall in order.
  return Promise.all(collection.manifests.map((manifest, key) => {
    let image = payloadsFromManifest(manifest, 1, false);
    if (image.length > 0) {
      console.info('Called using new manifest method.');
      return image[0];
    }
    image = manifest.getImageSource();
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

/**
 * Old way of loading payload from manifest. (historical)
 *
 * @deprecate
 * @param manifest
 * @param key
 * @param collection
 * @returns {Promise.<T>}
 */
export function singlePayloadFromManifest(manifest, key = null, collection = {}) {

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
 * Returns images extracted from manifest.
 *
 * @param manifest
 * @param max_images
 * @returns {Promise}
 */
export function payloadsFromManifest(manifest, max_images, wrap = true) {
  let promises = [];
  // We have a manifest.
  for (let payload of take(manifest.getAllImages(), max_images)) {
    payload.related = manifest.getRelatedItem();
    promises.push({ type: 'image', payload })
  }
  if (wrap) {
    return Promise.all(promises);
  }
  else {
    return promises;
  }
}

/**
 * Default resolver for IIIF Collection.
 *
 * @param url
 * @param max_images
 * @returns {Promise.<T>}
 */
export function IIIFCollectionResolver(url, max_images = 20) {
  return fetch(url).then((abstractType) => {

    // Map to manifest.
    if (abstractType['@type'] === 'sc:Manifest') {
      return payloadsFromManifest(new Manifest(abstractType), max_images);
    }

    // Map to collection.
    return payloadsFromCollection(new Collection(abstractType));
  });
}

import Gallery from './Gallery';
import Velocity from 'velocity-animate';
import { fetch, getQueryString, validateIIIFUri, getUriFromDropTarget } from './Util';

const nullFn = () => {};

// Has to be global;
var chooser = document.getElementById('chooser');

function resetAllTiles(gallery, collection) {
  if (chooser) {
    let item = multipleChoiceCreateListItem(gallery, {
      '@id': collection
    });
    chooser.appendChild(multipleChoiceCreateListItem(gallery, item));
    item.onclick();
  }
  else {
    gallery.resetAllTiles(collection);
  }
}

/**
 * Handles clicking of multiple choice element.
 *
 * @param gallery
 * @returns {Function}
 */
function multipleChoiceHandleClick(gallery) { return function() {
  gallery.resetAllTiles(this.getAttribute('data-uri'));
  Velocity(chooser, {
    top: 30,
    right: 20,
    margin: 0
  }, { 'duration': 300 })
}}

/**
 * Handles creation of list item in multiple choice list.
 * @param gallery
 * @param item
 * @returns {Element}
 */
function multipleChoiceCreateListItem(gallery, item) {
  let list_element = document.createElement('li');
  list_element.innerText = item.label || 'Default collection';
  list_element.setAttribute('data-uri', item['@id']);
  list_element.onclick = multipleChoiceHandleClick(gallery);
  return list_element;
}

/**
 * Multiple choice behaviour. Can be used by simply passing gallery instance.
 * @param gallery
 * @param doc
 * @returns {*}
 */
export function multipleChoiceBehaviour(gallery, doc = './collections.json') {
  if (!gallery instanceof Gallery) throw "You must pass an instance of the Gallery as the first option";
  fetch(doc).then((data) => {
    const { members } = data;
    // Loop members.
    for (let item of members) {
      chooser.appendChild(multipleChoiceCreateListItem(gallery, item));
    }
  });
  return gallery;
}

/**
 * Query string behaviour. Can be used by simply passing gallery instance.
 *
 * This will take
 *
 * @param gallery
 * @param query
 * @returns {*}
 */
export function queryStringBehaviour(gallery, query = 'collection') {
  if (!gallery instanceof Gallery) throw "You must pass an instance of the Gallery as the first option";
  let collection = getQueryString(query);
  if (collection) {
    resetAllTiles(gallery, collection);
  }
  return gallery;
}

/**
 * Clipboard behaviour.
 *
 * This will take in valid IIIF resource and try to load it into the
 * gallery application after a paste action (cmd-v).
 *
 * Adapted from: https://github.com/zimeon/iiif-dragndrop/blob/gh-pages/iiif-dragndrop.js#L82-L101
 *
 * @param gallery Gallery
 * @param reset bool
 * @return Gallery
 */
export function clipBoardBehaviour(gallery, reset = true) {
  if (!gallery instanceof Gallery) throw "You must pass an instance of the Gallery as the first option";
  document.addEventListener('paste', (e) => {
    // Pull out some variables from the event.
    const { isTrusted, type, clipboardData } = e;
    if (
        !isTrusted ||
        type !== 'paste' ||
        clipboardData === undefined
    ) {
      // Basic validation on the paste event.
      return;
    }
    // Stop other piece of code using the paste event. My bubbles.
    e.preventDefault();
    // Grab the clipboard.
    let collection = clipboardData.getData('Text').trim();
    // Validate and reset gallery.
    if (validateIIIFUri(collection)) {
      if (reset) {
        // Reset all the tiles to use collection from clipboard.
        resetAllTiles(gallery, collection);
      }
      else {
        // @todo implement appending of collections to collections.
      }
    }
  });
  // Always return gallery for composition.
  return gallery;
}

/**
 * Drag and drop behaviour.
 *
 * Allows URIs from IIIF-Drag-n-Drop spec as detailed here: http://zimeon.github.io/iiif-dragndrop/
 *
 * Adapted from: https://github.com/zimeon/iiif-dragndrop/blob/gh-pages/iiif-dragndrop.js#L49-L80
 *
 * @param gallery
 * @param configure
 */
export function dragDropBehaviour(gallery, configure = {}) {
  const {
      onDragOver = nullFn,
      onDragLeave = nullFn,
      onDragEnd = nullFn
  } = configure;
  // Grab and cache the outer-most container around the gallery.
  let galleryDropZone = document.getElementById(gallery.id);
  // Start some user configurable events.
  galleryDropZone.addEventListener('dragover', (e) => onDragOver(e, gallery) && e.preventDefault());
  galleryDropZone.addEventListener('dragend', (e) => onDragEnd(e, gallery) && e.preventDefault());
  galleryDropZone.addEventListener('dragleave', (e) => onDragLeave(e, gallery));
  // Implementation of drop event.
  galleryDropZone.addEventListener('drop', (e) => {
    // Prevent all the defaults.
    e.preventDefault();
    // Grab some data from the event.
    const { dataTransfer } = e;
    // Grab the URI from whatever was dragged.
    let uri = getUriFromDropTarget(dataTransfer);
    if (uri) {
      // Parse the URI to get manifest and image.
      let manifest = getQueryString('manifest', uri);
      let image = getQueryString('image', uri);
      let canvas = getQueryString('canvas', uri);
      // Handle manifests.
      if (manifest) {
        // @todo support more draggable manifests.
        resetAllTiles(gallery, manifest, canvas);
      }
      // Handle images.
      if (image) {
        // @todo implement behaviour for this.
        // resetAllTiles(gallery, image);
      }
    }
  });
}

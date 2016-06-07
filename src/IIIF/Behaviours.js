import Gallery from './Gallery';
import Velocity from 'velocity-animate';
import { fetch, getQueryString } from './Util';

// Has to be global;
var chooser = document.getElementById('chooser');

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
  list_element.setAttribute('data-uri', item.id);
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
  fetch(doc).then((data) => {
    for (let item of data) {
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
  let collection = getQueryString(query);
  if (collection) {
    if (chooser) {
      let item = multipleChoiceCreateListItem(gallery, {
        id: collection
      });
      chooser.appendChild(multipleChoiceCreateListItem(gallery, item));
      item.onclick();
    }
    else {
      gallery.resetAllTiles(collection);
    }
  }
  return gallery;
}

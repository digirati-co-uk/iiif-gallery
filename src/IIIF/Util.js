import OpenSeadragon from 'OpenSeadragon';

/**
 * OSD ajax wrapped in promise.
 *
 * @param url
 * @param json
 * @returns {Promise}
 */
export function fetch(url, json=true) {
  return new Promise((resolve, err) => {
    OpenSeadragon.makeAjaxRequest(url, (response) => {
      return json ? resolve(JSON.parse(response.responseText)) : resolve(response);
    }, err);
  });
}


export function throttle(fn, delay) {
  return function() {
    var now = (new Date).getTime();
    if (!fn.lastExecuted || fn.lastExecuted + delay < now) {
      fn.lastExecuted = now;
      fn.apply(fn, arguments);
    }
  }
}

/**
 * Maps array of objects to base object (_)
 *
 * @param _
 * @param props
 * @returns {Array}
 */
export function mapArrayOf(_, props) {
  if (!props) return [];
  let new_props = [];
  for (let prop of props) {
    new_props.push(new _(prop));
  }
  return new_props;
}

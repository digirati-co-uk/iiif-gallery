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

/*
 * memoize.js
 * by @philogb and @addyosmani
 * with further optimizations by @mathias
 * and @DmitryBaranovsk
 * perf tests: http://bit.ly/q3zpG3
 * Released under an MIT license.
 */
export function memoize( fn ) {
  return function () {
    var args = Array.prototype.slice.call(arguments),
        hash = "",
        i = args.length;
    currentArg = null;
    while (i--) {
      currentArg = args[i];
      hash += (currentArg === Object(currentArg)) ?
          JSON.stringify(currentArg) : currentArg;
      fn.memoize || (fn.memoize = {});
    }
    return (hash in fn.memoize) ? fn.memoize[hash] :
        fn.memoize[hash] = fn.apply(this, args);
  };
}

export function throttle(fn, delay) {
  return function() {
    var now = (new Date).getTime();
    if (!fn.lastExecuted || fn.lastExecuted + delay < now) {
      fn.lastExecuted = now;
      window.requestAnimationFrame(() => fn.apply(fn, arguments));
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

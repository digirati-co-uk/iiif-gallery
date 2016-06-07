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
    let args = Array.prototype.slice.call(arguments),
        hash = "",
        i = args.length,
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
      return fn.apply(fn, arguments);
    }
  }
}

export function debounce(fn, debounceDuration){
  // summary:
  //      Returns a debounced function that will make sure the given
  //      function is not triggered too much.
  // fn: Function
  //      Function to debounce.
  // debounceDuration: Number
  //      OPTIONAL. The amount of time in milliseconds for which we
  //      will debounce the function. (defaults to 100ms)

  debounceDuration = debounceDuration || 100;

  return function(){
    if(!fn.debouncing){
      var args = Array.prototype.slice.apply(arguments);
      fn.lastReturnVal = fn.apply(window, args);
      fn.debouncing = true;
    }
    clearTimeout(fn.debounceTimeout);
    fn.debounceTimeout = setTimeout(function(){
      fn.debouncing = false;
    }, debounceDuration);

    return fn.lastReturnVal;
  };
}

export function withContext(context, fn) {
  context.save();
  fn(context);
  context.restore();
}

export function getCanvasLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
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

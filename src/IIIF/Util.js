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

/**
 * Throttle.
 * @param fn
 * @param delay
 * @returns {Function}
 */
export function throttle(fn, delay) {
  return function() {
    var now = (new Date).getTime();
    if (!fn.lastExecuted || fn.lastExecuted + delay < now) {
      fn.lastExecuted = now;
      return fn.apply(fn, arguments);
    }
  }
}

/**
 * Debounce.
 * @param fn
 * @param debounceDuration
 * @returns {Function}
 */
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

/**
 * Sandbox for using canvas context safely.
 * @param context
 * @param fn
 */
export function withContext(context, fn) {
  context.save();
  fn(context);
  context.restore();
}

/**
 * Takes text and width and returns array of paragraph lines.
 * @param ctx
 * @param text
 * @param maxWidth
 * @returns {Array}
 */
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


/**
 * Get the value of a querystring
 * Source: http://gomakethings.com/how-to-get-the-value-of-a-querystring-with-native-javascript/
 *
 * @param  {String} field The field to get the value of
 * @param  {String} href   The URL to get the value from (optional)
 * @return {String}       The field value
 */
export function getQueryString( field, href = window.location.href ) {
  let reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
  let string = reg.exec(href);
  return string ? string[1] : null;
}


/**
 * Basic validation of IIIF endpoints.
 *
 * @todo fit to IIIF spec.
 * @param uri
 * @returns {boolean}
 */
export function validateIIIFUri(uri) {
  return !(uri.length<10 || uri.length>1200 || /\s/.test(uri));
}

/**
 * Returns URI from drop event.
 * @param dataTransfer
 * @returns {*}
 */
export function getUriFromDropTarget(dataTransfer) {
  if (!dataTransfer) return false;
  var parser = document.createElement('a');
  parser.href = dataTransfer.getData("text/uri-list");
  return (parser.search);
}

/**
 * Takes first X values of generator.
 * Adapted from: http://stackoverflow.com/a/30410454
 *
 * @param generator
 * @param n
 * @param allow_fewer
 * @returns {Array}
 */
export function take(generator, n, allow_fewer = true) {
  if (n <= 0) throw new Error("Invalid index");

  let i = 1;
  let result = [];

  for (let value of generator) {
    result.push(value);
    if (i++ == n) {
      return result;
    }
  }

  if (allow_fewer) {
    return result;
  }

  throw new Error("Generator has fewer than " + n + " elements");
}

/**
 * @type {number}
 */
var id_counter = 0;

/**
 * Simple counter for a unique number.
 * @returns {number}
 */
export function uid() {
  return ++id_counter
}

/**
 * Simple generator for a unique number.
 *
 * Can be used with `pick` above:
 *    pick(gen_uid, 3)
 *
 * returns 3 unique numbers.
 */
export function *gen_uid() {
  while (true) {
    yield ++id_counter;
  }
}

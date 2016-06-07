import { withContext, getCanvasLines } from './Util';

export function LabelShadow(width, height, context) {
  return {
    render(blur, alpha, x, y, isDark = true) {
      withContext(context, () => {
        context.rect(width, height, width * 10, height * 10);
        context.fillStyle = '';
        context.shadowColor = isDark ? '#000' : '#FFF';
        context.shadowBlur = blur;
        context.globalAlpha = alpha;
        context.shadowOffsetX = x;
        context.shadowOffsetY = y;
        context.fill();
      });
      return this;
    }
  }
}

/**
 * Creates label element canvas.
 * {
 *   @param label
 *   @param height
 *   @param width
 *   @param imagePath
 * }
 * @param opts
 *
 * @returns {Promise.<T>}
 */
export function LabelElement({ label, height, width, imagePath }, opts = {}) {
  // Label defaults, potential attributes.
  let padding = opts.padding || 1.5; // times the width.
  let font_size = opts.fontSize || 20;
  let font_family = opts.fontFamily || 'Helvetica';
  let line_height = opts.lineHeight || font_size*1.4; // 28
  let text_color = opts.color || '#333';

  let $canvas = document.createElement('canvas');
  $canvas.setAttribute('height', ''+height*12);
  $canvas.setAttribute('width', ''+width*12);
  let context = $canvas.getContext("2d");
  let shadow = new LabelShadow(width, height, context);

  // This needs to be a promise so that the browser loads the image source
  // before its rendered to the canvas.
  return asyncCreateImage(imagePath).then((backgroundImage) => {

    // Add all the shadows.
    shadow.render(40, '0.005', 0, 15)
          .render(15, '0.05', 0, 10)
          .render(15, '0.1', 0, 15)
          .render(1, '0.7', 0, -2, false)
          .render(4, '0.1', 0, -5, false)
          .render(4, '0.2', 0, 5);

    // Add the image.
    withContext(context, () => {
      backgroundImage.src = './images/label.png';
      context.drawImage(backgroundImage, width, height, width * 10, height * 10);
    });

    // Fill the text
    withContext(context, () => {
      context.fillStyle = text_color;
      context.globalAlpha = '0.9';
      context.font = 'bold '+font_size+'px '+font_family;
      let lines = getCanvasLines(context, label, width * 9);

      for (let i=0; i < lines.length; i++) {
        context.fillText(lines[i], width*padding, ((i+1) * line_height) + (height*padding));
      }
    });

    // Add texture lighting.
    withContext(context, () => {
      let gradient = context.createRadialGradient(width*6,height*6,0,width*6,height*6,height*6);
      gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.globalCompositeOperation = 'soft-light';
      // draw shape
      context.fillStyle = gradient;
      context.fillRect(width, height, width*10, height*10);
    });

    return $canvas;
  })}

/**
 * @private
 * @type {{}}
 */
let image_store = {};

/**
 * Creates image tag asynchronously.
 *
 * @param src
 * @returns {Promise}
 */
export function asyncCreateImage(src) {
  if (image_store[src]) return image_store[src];
  return image_store[src] = new Promise(function(resolve, err) {
    try {
      let image = new Image();
      image.src = src;
      image.onload = () => {  resolve(image) };
    }
    catch (e) {
      err(e);
    }
  });
}

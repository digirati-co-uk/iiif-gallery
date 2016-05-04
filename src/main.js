import OpenSeadragon from 'OpenSeadragon';
import assert from 'assert';

import Gallery from './IIIF/Gallery';
import Velocity from 'velocity-animate';

let gallery = new Gallery({
  id: "player",
  collection: 'http://wellcomelibrary.org/service/collections/recently-digitised/24/',
  visibilityRatio: 1,
  homeFillsViewer: true,
  constrainDuringPan: true,
  animationTime: 0.3,
  minZoomLevel: 0.0007,
  wallImageWidth: 180,
  wallImageSpacing: 100,
  wallOffsetTop: 150,
  show3DFloor: true
});


//setTimeout(() => {
//  gallery.resolve('http://wellcomelibrary.org/service/collections/recently-digitised/24/');
//}, 5000);
//
//gallery.addMediaType('video_url', function (payload, key, index) {
//  let container = document.createElement('div'),
//      video = document.createElement('video');
//
//  video.setAttribute('src', payload.url);
//  video.setAttribute('controls', false);
//
//  container.appendChild(video);
//  container.setAttribute('class', 'video');
//
//  this.appendWallHtml({element: container}, key, index);
//});
//
//gallery.queue.pushAll([
//  {type: 'video_url', payload: {url: 'http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv'}},
//  {type: 'video_url', payload: {url: 'http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv'}},
//]).flush();
//


import OpenSeadragon from 'OpenSeadragon';
import assert from 'assert';

import Gallery from './IIIF/Gallery';
import Velocity from 'velocity-animate';


// <div id="floor" class="floor"></div>
//const floor = document.getElementById('floor');
////Velocity(floor, {opacity: 0.5}, { duration: 1000 });
//
//window.addEventListener('scroll', function(e) {
//  Velocity(floor, { transformOriginX: window.pageXOffset+(window.innerWidth/2) }, {duration: 0});
//});

  let gallery = new Gallery({
    id: "player",
    collection: 'http://wellcomelibrary.org/service/collections/genres/Wet%20collodion%20negatives/',
    visibilityRatio: 1,
    animationTime: 0.3,
    minZoomLevel: 0.0007,
    wallImageWidth: 280,
    wallImageSpacing: 100,
    wallOffsetTop: 150,
    show3DFloor: true
  });
  console.log(gallery);

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



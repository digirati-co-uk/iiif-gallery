import OpenSeadragon from 'OpenSeadragon';
import assert from 'assert';

import Gallery from './IIIF/Gallery';
import Velocity from 'velocity-animate';
import { fetch } from './IIIF/Util';


let gallery = new Gallery({
  id: "player",
  //collection: 'http://wellcomelibrary.org/service/collections/recently-digitised/24/',
  visibilityRatio: 1,
  homeFillsViewer: true,
  constrainDuringPan: true,
  prefixUrl: 'images/',
  animationTime: 0.3,
  minZoomLevel: 0.0007,
  show3DFloor: true,
  springStiffness: 100
});



fetch('./collections.json').then((data) => {
  let chooser = document.getElementById('chooser');
  for (let item of data) {
    let list_element = document.createElement('li');
    list_element.innerText = item.label;
    list_element.setAttribute('data-uri', item.id);
    list_element.onclick =  function() {
      Velocity(gallery.element, {blur: 15}, {duration: 200 });
      gallery.world.removeAll();
      gallery.recalculateWall([]);
      gallery.queue.reset();
      gallery.resolve(this.getAttribute('data-uri'));
      Velocity(chooser, {
        top: 30,
        right: 20,
        margin: 0
      }, { 'duration': 300 })
    };
    chooser.appendChild(list_element);
  }
})


//setTimeout(() => {
//  gallery.resolve('http://wellcomelibrary.org/service/collections/recently-digitised/24/');
//}, 6000);
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


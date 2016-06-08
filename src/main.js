import OpenSeadragon from 'OpenSeadragon';
import assert from 'assert';

import Gallery, { createImageAction } from './IIIF/Gallery';
import Velocity from 'velocity-animate';
import { fetch, getQueryString } from './IIIF/Util';
import { multipleChoiceBehaviour, queryStringBehaviour, clipBoardBehaviour, dragDropBehaviour } from './IIIF/Behaviours';


let gallery = new Gallery({ id: "player" });

multipleChoiceBehaviour(gallery);
queryStringBehaviour(gallery);
clipBoardBehaviour(gallery);
dragDropBehaviour(gallery);

// Alternatively:
// clipBoardBehaviour(QueryStringBehaviour(multipleChoiceBehaviour(gallery)))



//fetch('./collections.json').then((data) => {
//  let chooser = document.getElementById('chooser');
//  for (let item of data) {
//    let list_element = document.createElement('li');
//    list_element.innerText = item.label;
//    list_element.setAttribute('data-uri', item.id);
//    list_element.onclick = function() {
//      gallery.resetAllTiles(this.getAttribute('data-uri'));
//      Velocity(chooser, {
//        top: 30,
//        right: 20,
//        margin: 0
//      }, { 'duration': 300 })
//    };
//    chooser.appendChild(list_element);
//  }
//});
//
//
//const QueryStringListener = function(gallery) {
//  let collection;
//  if (collection = getQueryString('collection')) {
//    gallery.resetAllTiles(collection);
//  }
//};
//
//QueryStringListener(gallery);



//document.getElementById('transition').onclick = () => {
//  let canvas = gallery.canvas.firstChild;
//  let overlay = document.getElementById('transition_plane');
//  let img = document.createElement('img');
//  img.src = canvas.toDataURL();
//  overlay.appendChild(img);
//  img.onload = () => {
//    //gallery.resetAllTiles("http://wellcomelibrary.org/service/collections/authors/Thomson,%20J./");
//    Velocity(gallery.canvas, {
//      translateX: "100%",
//      //rotateY: "-60deg",
//    }, { duration: 0, complete: () => {
//      Velocity(overlay,  {
//        translateZ: 0, // Force HA by animating a 3D property
//        translateX: "-105%",
//        scale: '1.5',
//        rotateY: "84deg"
//      }, { duration: 1000,  complete: () => {
//        overlay.innerHTML = '';
//        Velocity(overlay, {
//          translateX: "0%",
//          rotateY: "0deg",
//          scale: '1',
//        }, { duration: 0 })
//      }});
//      Velocity(gallery.canvas, { translateX: '0%', rotateY: "0deg", }, { easing: 'linear', duration: 1000 })
//
//    } })
//  }
//};


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


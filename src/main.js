import OpenSeadragon from 'OpenSeadragon';
import assert from 'assert';

import Gallery from './IIIF/Gallery';

let gallery = new Gallery('http://wellcomelibrary.org/service/collections/genres/Wet%20collodion%20negatives/', {
  id: "player",
  visibilityRatio: 1,
  animationTime: 0.3,
  minZoomLevel: 0.0007,
  wallImageWidth: 280,
  wallImageSpacing: 100,
  wallOffsetTop: 150
});

let videoGenerator = (url) => {

  let container = document.createElement('div');
  let video = document.createElement('video');

  video.setAttribute('src', url);
  video.setAttribute('controls', false);

  container.appendChild(video);
  container.setAttribute('class', 'video');

  return container;
  /*
   <div id="video">
   <video src="http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv" controls="false"></video>
   </div>
   */
};

gallery.queue.pushAll([
  { type: 'video', video: videoGenerator('http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv') },
  { type: 'video', video: videoGenerator('http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv') },
  { type: 'video', video: videoGenerator('http://upload.wikimedia.org/wikipedia/commons/7/79/Big_Buck_Bunny_small.ogv') }
]).flush();

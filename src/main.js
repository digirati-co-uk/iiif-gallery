import OpenSeadragon from 'OpenSeadragon';
import assert from 'assert';

import Gallery from './IIIF/Gallery';

window.gallery = new Gallery('http://wellcomelibrary.org/service/collections/genres/Wet%20collodion%20negatives/', {
  id: "player",
  visibilityRatio: 1,
  animationTime: 0.3,
  minZoomLevel: 0.0007,
  wallImageWidth: 280,
  wallImageSpacing: 100,
  wallOffsetTop: 150
});

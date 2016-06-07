import { ManifestFromCollection, IIIFCollectionResolver } from '../../src/IIIF/Resolver';

describe('IIIF Resolver', () => {

  it('should return array of actions when given wellcome library collection', function(done) {
    let response = IIIFCollectionResolver('http://wellcomelibrary.org/service/collections/genres/Advertising%20cards/');
    response.then((collection) => {
      expect(collection[0].type).toBe('image');
      expect(collection[1].type).toBe('image');
      expect(collection[2].type).toBe('image');

      expect(collection[0].payload.image).toEqual(jasmine.stringMatching(/^http/));
      expect(collection[1].payload.image).toEqual(jasmine.stringMatching(/^http/));
      expect(collection[2].payload.image).toEqual(jasmine.stringMatching(/^http/));
      done();
    })
  });

  //it('should return array of actions when given wellcome library manifest', function(done) {
  //  let response = IIIFCollectionResolver('http://wellcomelibrary.org/iiif/b18035723/manifest');
  //  response.then((collection) => {
  //    console.log(collection);
  //    done();
  //  })
  //})

  // List of ones to do.
  /*
   http://wellcomelibrary.org/iiif/b18035723/manifest
   http://wellcomelibrary.org/iiif/b23984971/manifest
   http://wellcomelibrary.org/iiif/b23984958/manifest
   http://wellcomelibrary.org/iiif/b18035978/manifest
   http://wellcomelibrary.org/iiif/b19684915/manifest
   http://wellcomelibrary.org/iiif/b1948799x/manifest
   http://wellcomelibrary.org/iiif/b16659090/manifest
   http://wellcomelibrary.org/iiif/b20605055/manifest
   http://wellcomelibrary.org/iiif/b16748967/manifest
   http://wellcomelibrary.org/iiif/b17307922/manifest
   http://wellcomelibrary.org/iiif/b17502792/manifest
   http://wellcomelibrary.org/iiif/b17564980/manifest
   http://wellcomelibrary.org/iiif/b19813508/manifest
   http://wellcomelibrary.org/iiif/b1818893x/manifest
   http://wellcomelibrary.org/iiif/b17307703/manifest
   http://wellcomelibrary.org/iiif/b11599820/manifest
   http://wellcomelibrary.org/iiif/b21072061/manifest
   http://wellcomelibrary.org/iiif/b19684538/manifest
   http://wellcomelibrary.org/iiif/collection/b19974760
   http://wellcomelibrary.org/iiif/collection/b18031511
   http://wellcomelibrary.org/iiif/b21274344/manifest
   http://wellcomelibrary.org/iiif/b13266330/manifest
   https://iiif.archivelab.org/iiif/principleofrelat00eins/manifest.json
   http://api.bl.uk/metadata/iiif/ark:/81055/vdc_100022545251.0x000002/manifest.json
   http://sanddragon.bl.uk/IIIFMetadataService/or_1459.json
   http://files.universalviewer.io/manifests/adiks/Add_11831.json
   http://files.universalviewer.io/manifests/adiks/Add_4709.json
   http://files.universalviewer.io/manifests/adiks/Or_1087.json
   http://files.universalviewer.io/manifests/adiks/Or_13027.json
   http://files.universalviewer.io/manifests/adiks/or_7694_1580.json
   http://files.universalviewer.io/manifests/adiks/or_7694_1595.json
   http://files.universalviewer.io/manifests/adiks/or_7694_1655_1672.json
   http://files.universalviewer.io/manifests/adiks/or_7694_1988_part1.json
   http://files.universalviewer.io/manifests/adiks/or_7694_1988_part2.json
   http://dams.llgc.org.uk/iiif/2.0/4389767/manifest.json
   http://dams.llgc.org.uk/iiif/2.0/1123257/manifest.json
   http://dams.llgc.org.uk/iiif/archive/3975658/fonds.json
   http://iiif.bodleian.ox.ac.uk/examples/mushaf4.json
   http://dms-data.stanford.edu/data/manifests/RomanCoins/bb853kn3021/manifest.json
   http://dms-data.stanford.edu/data/manifests/McLaughlin/bc788vp3448/manifest.json
   http://dms-data.stanford.edu/data/manifests/kn/mw497gz1295/manifest.json
   http://digital.library.villanova.edu/Item/vudl:24299/Manifest
   http://digital.library.villanova.edu/Collection/vudl:3/IIIF
   http://digital.library.villanova.edu/Collection/vudl:3/IIIF
   http://digital.library.villanova.edu/Item/vudl:60609/Manifest
   http://digital.library.villanova.edu/Item/vudl:30471/Manifest
   https://iiif.riksarkivet.se/arkis!C0000263/manifest
   http://www.qdl.qa/en/iiif/81055/vdc_100000001524.0x000395/manifest
   http://www.qdl.qa/العربية/iiif/81055/vdc_100000004987.0x000001/manifest
   http://shared.ugent.be/IIIF/collections/rug01-002212499
   http://shared.ugent.be/IIIF/collections/jan-frans-willems
   http://manifests.ydc2.yale.edu/manifest/Scroll
   http://files.universalviewer.io/manifests/nelis/animal-skull.json
   http://files.universalviewer.io/manifests/nelis/ecorche.json
   http://files.universalviewer.io/manifests/foundobjects/thekiss.json
   http://files.universalviewer.io/manifests/nelis/skull.json
   http://files.universalviewer.io/manifests/demo/nefertiti.json
   http://tomcrane.github.io/scratch/manifests/top-to-bottom.json
   http://tomcrane.github.io/scratch/manifests/bottom-to-top.json
   https://ipfs.io/ipfs/QmYomyCpT1vKNovYvTjAStYq31JoaH8xdivjmWcDj5mpM1
   */




});

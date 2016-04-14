# Gallery

Load a IIIF collection or a manifest and see the images rendered as a gallery wall. You can zoom into each image (each is a separate IIIF tile source) and also into the little wall card/plaque next to the image, which is generated from the metadata in the IIIF resource.

Something like this:

Take a collection:

http://wellcomelibrary.org/service/collections/genres/Wet%20collodion%20negatives/

(see the HTML version here: http://wellcomelibrary.org/collections/browse/genres/Wet%20collodion%20negatives/)

Gallery renders it like this:





Threee types of asset are loaded into the OpenSeadragon.

1) The gallery wall background. This is a IIIF tilesource, we can serve this from the DLCS. It looks something like this:

https://www.google.co.uk/search?q=gallery+wall&rlz=1C1CHFX_en-GBGB565GB565&espv=2&biw=1920&bih=1099&site=webhp&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiolMOK4o3MAhWCiRoKHfDSD0wQ_AUIBigB#tbm=isch&q=blank+gallery+wall&imgrc=QeXg_z23xbhYFM%3A

... but it needs to tile horizontally to accommodate the images, so we can't have obvious vanishing points from the planks on the floor etc. It needs a fairly featureless wall.
A JavaScript application based on OpenSeadragon. Has one server side component to generate a photorealistic"

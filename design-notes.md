# Gallery

Load a IIIF collection or a manifest and see the images rendered as a gallery wall. You can zoom into each image (each is a separate IIIF tile source) and also into the little wall label next to the image, which is generated from the metadata in the IIIF resource.

Take a collection:

http://wellcomelibrary.org/service/collections/genres/Wet%20collodion%20negatives/

(see the HTML version here: http://wellcomelibrary.org/collections/browse/genres/Wet%20collodion%20negatives/)

Gallery renders it like this:

![Wall](/wall.jpg?raw=true "Wall")

(without the obvious joins etc).

Gallery is a JavaScript application based on OpenSeadragon (OSD). It's full screen with an input box to paste the IIIF collection URI (or manifest URI). It also accepts drag and drop of a IIIF resource (see http://zimeon.github.io/iiif-dragndrop/). It has one server side component to generate a photorealistic wall label (unless you can do something really clever with canvas in the browser).

Three types of asset are loaded into the OpenSeadragon world:

### The gallery wall background

This is a IIIF tilesource, we can serve this from the DLCS. It looks something like this:

https://www.google.co.uk/search?q=gallery+wall&rlz=1C1CHFX_en-GBGB565GB565&espv=2&biw=1920&bih=1099&site=webhp&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiolMOK4o3MAhWCiRoKHfDSD0wQ_AUIBigB#tbm=isch&q=blank+gallery+wall&imgrc=QeXg_z23xbhYFM%3A

... but it needs to tile horizontally to accommodate the images, so we can't have obvious vanishing points from the planks on the floor etc. It needs a fairly featureless wall and floor, but it needs to be real. The gallery code loads as many repeated wall tileSources in as will be required to stretch the wall to fit the images. I suggest we have a limit of 20 images to begin with (see configuration).

I will try to source an appropriate image for this.

### The IIIF images themselves

If the gallery is initialised with a iiif:Collection, it must be a collection of manifests (not a collection of collections). Gallery should support the "members" syntax (http://iiif.io/api/presentation/2.1/#members-1) as well as the older "manifests" syntax. The gallery should dereference each manifest (up to 20), and use the iiif image API service on the first image of the first canvas. 

If the gallery is initialised with a iiif:Manifest, it should render the first 20 images in the first sequence.

### The wall label 

![Label](https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Wayne-Thiebaud---De-Young-1_label.jpg/512px-Wayne-Thiebaud---De-Young-1_label.jpg?raw=true "Label")

https://thepracticalartworld.com/2014/06/18/examples-of-artwork-labels/

We could do something with OSD overlays but I want the label to look photorealistic, I think we want to render it on the server. I want it to look like it's made from card. It doesn't need to be a multi-zoom level image - it can be the absolutely simplest IIIF tilesource which is a fixed sizes array of length 1 (see https://tomcrane.github.io/scratch/osd/iiif-sizes.html, "1 size only"). The server side component has to generate and return two different resources:

a. http://gallery.org/wall-label/-url-encoded-iiif-resource-URI-/info.json

b. http://gallery.org/wall-label/-url-encoded-iiif-resource-URI-/full/1000,/0/default.jpg

...where the info.json looks something like this:

```
{
  "@context": "http://iiif.io/api/image/2/context.json",
  "@id": "http://gallery.org/wall-label/<url-encoded-iiif-resource-URI>",
  "protocol": "http://iiif.io/api/image",
  "width": 1000,
  "height": 800,
  "profile": ["http://iiif.io/api/image/2/level0.json"],
  "sizes" : [
    {"width" : 1000, "height": 800}
  ]
}
```

(it doesn't have to be 1000 x 800 - whatever works). If the iiif-resource is a manifest, the server uses the metadata labels - maybe with some parsing and truncation rules becasue some descriptions could be way too long, it needs to fit on a sensible size label. If the manifest has an "attribution" notice, that must be shown. The server dynamically generates the single image and will return it in response to b) above. It must use some variant of Helvetica as the typeface! 

If the gallery was generated from a manifest then we only have one set of manifest metadata, so just add a label next to the first image. A later enhancement can create a label from canvas-level metadata.

## Configuration

* max-images: 20 (gallery should top adding images after this number)
* wall-image-service: ... (iiif image api endpoint OSD uses as a tilesource for the background)
* label-image: ... (endpoint to generate an image from iiif resource metadata)
* etc

## Hosting

The gallery app itself could be hosted on the gh-pages branch of this repo - but we need some server side code running to generate the label image service. I have no opinion about what language you do that in. PHP, Python, Ruby, Elixir... whatever you fancy. Anything with familiar graphics libraries.


export default class ImageQueue {

  constructor(flush, images = []) {
    this._flush = flush;
    this._images = images;
    if (images) {
      this.flush();
    }
  }

  reset() {
    this._images = [];
  }

  sizeOf() {
    return this._images.length;
  }

  push(image) {
    this._images.push(image);
    return this;
  }

  pushAll(images) {
    if (typeof images === 'string') images = [images];
    this._images = [].concat(this._images, images);
    return this;
  }

  onFlushEnd(images) { }
  beforeFlushStart(images) { }

  flush() {
    this.beforeFlushStart(this._images);
    this._images.forEach(this._flush);
    this.onFlushEnd(this._images);
  }

  pop() {
    let popped = this._images.pop();
    this.flush(this._images);
    return popped;
  }

}

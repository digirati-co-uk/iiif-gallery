
export default class ImageQueue {

  constructor(flush, images = []) {
    this._flush = flush;
    this._images = images;
    if (images) {
      this.flush();
    }
  }

  push(image) {
    this._images.push(image);
    return this;
  }

  pushAll(images) {
    if (typeof images === 'string') images = [images];
    this._images.merge(images);
    return this;
  }

  flush() {
    console.log('flushing...', this._images);
    this._images.forEach(this._flush)
  }

  pop() {
    let popped = this._images.pop();
    this.flush(this._images);
    return popped;
  }

}

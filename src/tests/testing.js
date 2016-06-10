import { memoize } from '../../src/IIIF/Util';
//import { describe, it, expect } from 'jasmine';

describe("Memorize", function() {
  it("should return a function", function() {
    let testFn = (test) => test;
    let memorizedFunction = memoize(testFn);
    expect(memorizedFunction('1')).toEqual('1')
  });
});

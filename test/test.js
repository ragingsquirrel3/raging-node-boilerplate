import assert from 'assert';
import getOne from '../lib';
describe('getOne()', function () {
  it('should return 1', function () {
    assert.equal(getOne(), 1);
  });
});

var assert = require('assert');
var sut = require(".././sendroles");

describe('SendRoles', function() {
  describe('#Shuffle()', function() {
    it('The resulting array after shuffle should not keep same order as the initial one', function() {
      let initialArray = [1,2,3,4,5,6,7,8,9];
      let result = sut.shuffleArray(initialArray);

      const reversed = initialArray.reverse(); // change after the shuffle is the reverse its almost 0 == 1 / Fact(9)

      let found = false;
      for(i = 0; i < reversed.length ;i++)
      {
        if(reversed[i] + result[i] != initialArray[0] + initialArray[initialArray.length -1])
          found + true; // Because Gauss formula Sum of N first integers
      }
      assert.match(true, found);
    });
  });
});
var assert = require('chai').assert;
var sut = require('../sendroles.js');

describe('SendRoles', function() {
  describe('#Shuffle()', function() {
    it('The resulting array after shuffle should not keep same order as the initial one', function() {
      let initialArray = [1,2,3,4,5,6,7,8,9];
      let result = sut.shuffleArray(initialArray);

      const reversed = [...initialArray].reverse(); // change after the shuffle is the reverse its almost 0 == 1 / Fact(9)

      let found = false;
      for(i = 0;  !found && i < reversed.length ;i++)
      {
        if(reversed[i] + result[i] != initialArray[0] + initialArray[initialArray.length -1])
          found = true; // Because Gauss formula Sum of N first integers
      }
      assert.equal(true, found);
    });
  });

  describe('#AssignCharacters and enrich them', function() {
    it('The resulting array after shuffle should not keep same order as the initial one', function() {
      let gameSetup = [
        {
            "Name":"GoodGuy[x]",
            "Roles":["GoodGuy"],
            "Number":"4"
        },
        {
            "Name":"BadGuy[x]",
            "Roles":["BadGuy"],
            "Number":"2"
        },
        {
            "Name":"Merlin",
            "Roles":["GoodGuy"],
            "Number":"1",
            "KnowRoles":["BadGuy"]
        }
    ];

    let shuffledEmails = [
      {"mail":"friendsEmails1@gmail.com", "aka":"FriendsNames1"},
      {"mail":"friendsEmails2@gmail.com", "aka":"FriendsNames2"},
      {"mail":"friendsEmails3@gmail.com", "aka":"FriendsNames3"},
      {"mail":"friendsEmails4@gmail.com", "aka":"FriendsNames4"},
      {"mail":"friendsEmails5@gmail.com", "aka":"FriendsNames5"},
      {"mail":"friendsEmails6@gmail.com", "aka":"FriendsNames6"},
      {"mail":"friendsEmails7@gmail.com", "aka":"FriendsNames7"}
    ];

    let characters = sut.assignCharacters(gameSetup, shuffledEmails);
      assert.equal(shuffledEmails.length, characters.length);

    characters = sut.enrichCharacters(characters);

    let merlin = characters.filter(e => e.Name == 'Merlin')[0];
    assert.isTrue(merlin.EnrichedInfo.length > 0);
    assert.equal(merlin.KnowRoles.length, 1);    
    });
  });
});
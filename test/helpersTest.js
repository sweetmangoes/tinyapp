const assert = require('chai');
const { describe } = require('mocha');

const { findUserByEmail } = require('../index');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserbyEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID, 'should return userRandomID')
  });

  it('should return a undefined ', function() {
    const user = findUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "user";
    assert.equal(user, expectedUserID, 'should return undefined')
  });

});

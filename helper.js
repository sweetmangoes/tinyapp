
const findUserByEmail = (userDatabase, userEmail) => {
  for (const id in userDatabase) {
    if (userEmail === userDatabase[id]["email"]) {
      return userDatabase[id];
    }
  }
  return false;
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function randomUserId() {
  return Math.random().toString(36).substr(2, 4);
}

module.exports = {
  findUserByEmail,
  generateRandomString, 
  randomUserId
}

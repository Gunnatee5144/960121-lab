const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'registeredUsers.json');

function loadUsers() {
  const fileContents = fs.readFileSync(usersFilePath, 'utf8');
  const parsedUsers = JSON.parse(fileContents);

  if (!Array.isArray(parsedUsers)) {
    throw new Error('registeredUsers.json must contain an array of users');
  }

  return parsedUsers;
}

let users = loadUsers();

function cloneUser(user) {
  return JSON.parse(JSON.stringify(user));
}

function getUserByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const user = users.find(function(item) {
    return String(item.username || '').trim().toLowerCase() === normalizedEmail;
  });

  return user ? cloneUser(user) : null;
}

function getAllUsers() {
  return users.map(cloneUser);
}

module.exports = {
  getUserByEmail: getUserByEmail,
  getAllUsers: getAllUsers
};

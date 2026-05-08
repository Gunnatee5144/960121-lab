const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '..', 'data', 'auth_user.json');

function loadUsers() {
  const fileContents = fs.readFileSync(usersFilePath, 'utf8');
  const parsedUsers = JSON.parse(fileContents);

  if (!Array.isArray(parsedUsers)) {
    throw new Error('auth_user.json must contain an array of users');
  }

  return parsedUsers;
}

let users = loadUsers();

function cloneUser(user) {
  return JSON.parse(JSON.stringify(user));
}

function getNextUserId() {
  return users.reduce(function(nextId, user) {
    const userId = Number(user.id);

    if (Number.isNaN(userId)) {
      return nextId;
    }

    return Math.max(nextId, userId + 1);
  }, 1);
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

function isUsernameTaken(email) {
  return Boolean(getUserByEmail(email));
}

function createUser(data) {
  const newUser = {
    id: getNextUserId(),
    username: String(data.username).trim().toLowerCase(),
    password: String(data.password),
    firstName: String(data.firstName).trim(),
    registeredAt: data.registeredAt || new Date().toISOString().slice(0, 10)
  };

  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

  return cloneUser(newUser);
}

module.exports = {
  getUserByEmail: getUserByEmail,
  getAllUsers: getAllUsers,
  isUsernameTaken: isUsernameTaken,
  createUser: createUser
};
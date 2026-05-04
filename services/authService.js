const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userStore = require('../data/userStore');

function login(email, password) {
  const user = userStore.getUserByEmail(email);

  if (!user) {
    return { status: 401, message: 'Unauthorized' };
  }

  if (!password) {
    return { status: 400, message: 'Email and password are required' };
  }

  const passwordMatches = bcrypt.compareSync(String(password), String(user.password));

  if (!passwordMatches) {
    return { status: 401, message: 'Unauthorized' };
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return { status: 500, message: 'JWT_SECRET is not configured' };
  }

  const token = jwt.sign(
    { userId: user.id },
    secret,
    { expiresIn: '1h' }
  );

  return {
    status: 200,
    token: token
  };
}

module.exports = {
  login: login
};

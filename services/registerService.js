const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

function isPasswordValid(password) {
  const value = String(password || '');
  const hasMinimumLength = value.length >= 8;
  const hasUppercase = /[A-Z]/.test(value);
  const hasSpecialCharacter = /[!@#$%^&*]/.test(value);

  return hasMinimumLength && hasUppercase && hasSpecialCharacter;
}

function registerUser(data) {
  const firstName = String(data && data.firstName || '').trim();
  const username = String(data && data.username || '').trim().toLowerCase();
  const password = String(data && data.password || '');

  if (!firstName || !username || !password) {
    return { status: 400, message: 'firstName, username, and password are required' };
  }

  if (!isPasswordValid(password)) {
    return {
      status: 400,
      message: 'Password must be at least 8 characters with one uppercase letter and one special character'
    };
  }

  if (userRepository.isUsernameTaken(username)) {
    return { status: 409, message: 'Username already exists' };
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const createdUser = userRepository.createUser({
    firstName: firstName,
    username: username,
    password: hashedPassword
  });

  if (!createdUser) {
    return { status: 500, message: 'Error creating user' };
  }

  return {
    status: 201,
    user: {
      id: createdUser.id,
      username: createdUser.username,
      firstName: createdUser.firstName,
      registeredAt: createdUser.registeredAt
    }
  };
}

module.exports = {
  registerUser: registerUser,
  isPasswordValid: isPasswordValid
};

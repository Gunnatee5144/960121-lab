const registerService = require('../services/registerService');

function register(request, response) {
  try {
    const result = registerService.registerUser(request.body || {});

    if (result.status === 201) {
      return response.status(201).json({
        message: 'User registered successfully',
        user: result.user
      });
    }

    return response.status(result.status).json({ message: result.message });
  } catch (error) {
    return response.status(500).json({ message: 'Error processing registration' });
  }
}

module.exports = {
  register: register
};

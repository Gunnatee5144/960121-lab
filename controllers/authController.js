const authService = require('../services/authService');

function login(request, response) {
  try {
    const email = request.body.email;
    const password = request.body.password;
    const result = authService.login(email, password);

    if (result.status === 200) {
      return response.status(200).json({ token: result.token });
    }

    return response.status(result.status).json({ message: result.message });
  } catch (error) {
    return response.status(500).json({ message: 'Error processing login' });
  }
}

module.exports = {
  login: login
};

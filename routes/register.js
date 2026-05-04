const express = require('express');
const registerController = require('../controllers/registerController');

const router = express.Router();

// POST /api/register
// The frontend sends the user's name, username email, and password.
// The backend validates the password rules, checks for duplicates, hashes the
// password, and stores the new user in auth_user.json.
router.post('/', registerController.register);

module.exports = router;

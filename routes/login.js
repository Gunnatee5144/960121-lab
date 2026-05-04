const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/login
// The controller receives the submitted email and password, checks the user
// record, and returns a signed JWT when the credentials are valid.
router.post('/', authController.login);

module.exports = router;

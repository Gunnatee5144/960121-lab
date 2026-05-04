(function() {
  'use strict';

  var form = document.getElementById('register-form');
  var passwordInput = document.getElementById('password');
  var statusBox = document.getElementById('register-status');
  var feedbackBox = document.getElementById('password-feedback');

  var passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

  function setStatus(message, isError) {
    if (!statusBox) {
      return;
    }

    statusBox.textContent = message;
    statusBox.className = isError ? 'status-message text-danger' : 'status-message text-success';
  }

  function validatePassword(value) {
    if (!value) {
      return 'Password is required.';
    }

    if (value.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (!/[!@#$%^&*]/.test(value)) {
      return 'Password must contain at least one special character.';
    }

    return '';
  }

  function updatePasswordFeedback() {
    if (!feedbackBox || !passwordInput) {
      return;
    }

    var message = validatePassword(passwordInput.value);
    feedbackBox.textContent = message;
    feedbackBox.className = message ? 'small text-danger' : 'small text-success';

    if (!message && passwordInput.value) {
      feedbackBox.textContent = 'Password meets the requirements.';
    }
  }

  if (!form || !passwordInput) {
    return;
  }

  passwordInput.addEventListener('input', updatePasswordFeedback);

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    var firstName = document.getElementById('firstName').value.trim();
    var username = document.getElementById('username').value.trim().toLowerCase();
    var password = passwordInput.value;
    var passwordError = validatePassword(password);

    if (!firstName || !username) {
      setStatus('Name and email are required.', true);
      return;
    }

    if (passwordError) {
      setStatus(passwordError, true);
      updatePasswordFeedback();
      return;
    }

    setStatus('Registering user...', false);

    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: firstName,
        username: username,
        password: password
      })
    })
      .then(function(response) {
        return response.json().then(function(payload) {
          return {
            status: response.status,
            payload: payload
          };
        });
      })
      .then(function(result) {
        if (result.status !== 201) {
          setStatus(result.payload.message || 'Registration failed.', true);
          return;
        }

        setStatus('Registration successful. You can now log in.', false);
        form.reset();
        feedbackBox.textContent = '';
      })
      .catch(function() {
        setStatus('Unable to register right now.', true);
      });
  });
})();

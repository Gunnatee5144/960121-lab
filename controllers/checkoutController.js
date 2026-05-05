const checkoutService = require('../services/checkoutService');

function checkout(request, response) {
  try {
    const result = checkoutService.saveOrder(request.body || {});

    if (result.status === 201) {
      return response.status(201).json({
        message: 'Order saved successfully',
        order: result.order
      });
    }

    return response.status(result.status).json({
      message: result.message,
      errors: result.errors || {}
    });
  } catch (error) {
    return response.status(400).json({
      message: 'Save Order failed',
      errors: {
        saveOrder: 'Save Order failed. Please try again.'
      }
    });
  }
}

module.exports = {
  checkout: checkout
};
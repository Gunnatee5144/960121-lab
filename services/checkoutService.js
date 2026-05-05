const orderStore = require('../data/orderStore');
const productService = require('./productService');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCardNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCartItems(cartItems) {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    return { error: 'Cart items are required.' };
  }

  const normalizedItems = [];

  for (let index = 0; index < cartItems.length; index += 1) {
    const item = cartItems[index] || {};
    const productId = String(item.productId || item.id || '').trim();
    const quantity = parseInt(item.quantity, 10);

    if (!productId) {
      return { error: 'Each cart item must include a product ID.' };
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: 'Each cart item must include a quantity greater than zero.' };
    }

    const product = productService.getProductById(productId);

    if (!product) {
      return { error: 'One or more cart items could not be found.' };
    }

    normalizedItems.push({
      productId: String(product.id),
      title: product.title,
      price: Number(product.price),
      quantity: quantity
    });
  }

  return { items: normalizedItems };
}

function calculateTotal(cartItems) {
  return cartItems.reduce(function(total, item) {
    return total + (Number(item.price) * Number(item.quantity));
  }, 0);
}

function saveOrder(data) {
  const normalizedEmail = normalizeEmail(data.email);
  const cardNumber = normalizeCardNumber(data.cardNumber);
  const normalizedCartItems = normalizeCartItems(data.cartItems);
  const errors = {};

  if (!normalizedCartItems.items) {
    errors.cartItems = normalizedCartItems.error;
  }

  if (!isValidEmail(normalizedEmail)) {
    errors.email = 'A valid email address is required.';
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    errors.cardNumber = 'A 16-digit credit card number is required.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: 400,
      message: 'Checkout validation failed',
      errors: errors
    };
  }

  const total = calculateTotal(normalizedCartItems.items);

  try {
    const savedOrder = orderStore.createOrder({
      email: normalizedEmail,
      cardLast4: cardNumber.slice(-4),
      items: normalizedCartItems.items,
      total: Number(total.toFixed(2)),
      createdAt: new Date().toISOString()
    });

    return {
      status: 201,
      order: savedOrder
    };
  } catch (error) {
    return {
      status: 400,
      message: 'Save Order failed',
      errors: {
        saveOrder: 'Save Order failed. Please try again.'
      }
    };
  }
}

module.exports = {
  saveOrder: saveOrder,
  calculateTotal: calculateTotal,
  normalizeCartItems: normalizeCartItems,
  isValidEmail: isValidEmail
};
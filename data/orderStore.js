const fs = require('fs');
const path = require('path');

const ordersFilePath = path.join(__dirname, 'orders.json');

function loadOrders() {
  if (!fs.existsSync(ordersFilePath)) {
    return [];
  }

  const fileContents = fs.readFileSync(ordersFilePath, 'utf8');

  if (!fileContents.trim()) {
    return [];
  }

  const parsedOrders = JSON.parse(fileContents);

  if (!Array.isArray(parsedOrders)) {
    throw new Error('orders.json must contain an array of orders');
  }

  return parsedOrders;
}

let orders = loadOrders();

function cloneOrder(order) {
  return JSON.parse(JSON.stringify(order));
}

function getNextOrderId() {
  return orders.reduce(function(nextId, order) {
    const orderId = Number(order.id);

    if (Number.isNaN(orderId)) {
      return nextId;
    }

    return Math.max(nextId, orderId + 1);
  }, 1);
}

function saveOrders() {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
}

function createOrder(data) {
  const newOrder = {
    id: getNextOrderId(),
    email: String(data && data.email || '').trim().toLowerCase(),
    cardLast4: String(data && data.cardLast4 || '').trim(),
    items: Array.isArray(data && data.items) ? data.items.map(cloneOrder) : [],
    total: Number(data && data.total) || 0,
    createdAt: data && data.createdAt ? String(data.createdAt) : new Date().toISOString()
  };

  orders.push(newOrder);
  saveOrders();

  return cloneOrder(newOrder);
}

module.exports = {
  createOrder: createOrder
};
const database = require('./database');

function toNumber(value) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function buildOrderRows(data) {
  if (Array.isArray(data && data.items) && data.items.length > 0) {
    return data.items.map(function(item) {
      const quantity = toNumber(item && item.quantity) || 1;
      const price = toNumber(item && item.price) || 0;

      return {
        userId: toNumber(data && data.userId),
        productId: toNumber(item && item.productId),
        quantity: quantity,
        totalPrice: Number((price * quantity).toFixed(2))
      };
    });
  }

  return [{
    userId: toNumber(data && data.userId),
    productId: toNumber(data && data.productId),
    quantity: toNumber(data && data.quantity) || 1,
    totalPrice: Number(toNumber(data && data.totalPrice) || 0)
  }];
}

function createOrder(data) {
  const orderRows = buildOrderRows(data).filter(function(row) {
    return row.productId !== null;
  });

  if (!orderRows.length) {
    return Promise.reject(new Error('An order must include at least one product_id.'));
  }

  const insertSql = 'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)';

  return orderRows.reduce(function(chain, orderRow) {
    return chain.then(function(savedRows) {
      return database.run(insertSql, [
        orderRow.userId,
        orderRow.productId,
        orderRow.quantity,
        orderRow.totalPrice
      ]).then(function(result) {
        savedRows.push({
          id: result.id,
          userId: orderRow.userId,
          productId: orderRow.productId,
          quantity: orderRow.quantity,
          totalPrice: orderRow.totalPrice
        });

        return savedRows;
      });
    });
  }, Promise.resolve([])).then(function(savedRows) {
    return savedRows.length === 1 ? savedRows[0] : savedRows;
  });
}

module.exports = {
  createOrder: createOrder
};
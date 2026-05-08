const database = require('../data/database');

function createOrder(data) {
  const insertSql = 'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)';

  return database.run(insertSql, [
    data.userId,
    data.productId,
    data.quantity,
    data.totalPrice
  ]).then(function(result) {
    return {
      id: result.id,
      userId: data.userId,
      productId: data.productId,
      quantity: data.quantity,
      totalPrice: data.totalPrice
    };
  });
}

module.exports = {
  createOrder: createOrder
};
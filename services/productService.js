const productsStore = require('../data/productsStore');

function getAllProducts() {
  return productsStore.getAllProducts();
}

function getProductById(id) {
  return productsStore.getProductById(id);
}

function createProduct(data) {
  return productsStore.createProduct(data);
}

function updateProduct(id, data) {
  return productsStore.updateProduct(id, data);
}

function deleteProduct(id) {
  return productsStore.deleteProduct(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

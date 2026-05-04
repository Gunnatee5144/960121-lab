const productsStore = require('../data/productsStore');

function getAllProducts(category) {
  // Pass the category filter through so the data layer can return only the
  // products requested by the browser.
  return productsStore.getAllProducts(category);
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

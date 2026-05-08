const productRepository = require('../repositories/productRepository');

function normalizeCategory(category) {
  return String(category || '').trim().toLowerCase();
}

function normalizeProductInput(data) {
  const title = String(data && data.title || '').trim();
  const price = Number(data && data.price);

  if (!title || Number.isNaN(price)) {
    return null;
  }

  return {
    title: title,
    price: price,
    image: data && data.image ? String(data.image) : '',
    href: data && data.href ? String(data.href) : '#',
    crossIcon: data && data.crossIcon ? String(data.crossIcon) : 'images/cross.svg'
  };
}

function normalizeProductUpdate(data) {
  const update = {};

  if (typeof data.title !== 'undefined') {
    update.title = String(data.title).trim();

    if (!update.title) {
      return null;
    }
  }

  if (typeof data.price !== 'undefined') {
    update.price = Number(data.price);

    if (Number.isNaN(update.price)) {
      return null;
    }
  }

  if (typeof data.image !== 'undefined') {
    update.image = String(data.image);
  }

  if (typeof data.href !== 'undefined') {
    update.href = String(data.href);
  }

  if (typeof data.crossIcon !== 'undefined') {
    update.crossIcon = String(data.crossIcon);
  }

  return update;
}

function getAllProducts(category) {
  return productRepository.getAllProducts(normalizeCategory(category));
}

function getProductById(id) {
  return productRepository.getProductById(id);
}

function createProduct(data) {
  const product = normalizeProductInput(data);

  if (!product) {
    return null;
  }

  return productRepository.createProduct(product);
}

function updateProduct(id, data) {
  const update = normalizeProductUpdate(data || {});

  if (!update) {
    return null;
  }

  return productRepository.updateProduct(id, update);
}

function deleteProduct(id) {
  return productRepository.deleteProduct(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};

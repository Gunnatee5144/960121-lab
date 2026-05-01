const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, 'products.json');

function loadProducts() {
  const fileContents = fs.readFileSync(productsFilePath, 'utf8');
  const parsedProducts = JSON.parse(fileContents);

  if (!Array.isArray(parsedProducts)) {
    throw new Error('products.json must contain an array of products');
  }

  return parsedProducts;
}

let products = loadProducts();

function saveProducts() {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

function cloneProduct(product) {
  return JSON.parse(JSON.stringify(product));
}

function getNextProductId() {
  return products.reduce(function(nextId, product) {
    const productId = Number(product.id);

    if (Number.isNaN(productId)) {
      return nextId;
    }

    return Math.max(nextId, productId + 1);
  }, 1);
}

function getAllProducts() {
  return products.map(cloneProduct);
}

function getProductById(id) {
  const productId = String(id);
  const product = products.find(function(item) {
    return String(item.id) === productId;
  });

  return product ? cloneProduct(product) : null;
}

function createProduct(data) {
  if (!data || !data.title || typeof data.price === 'undefined') {
    return null;
  }

  const newProduct = {
    id: getNextProductId(),
    title: String(data.title).trim(),
    price: Number(data.price),
    image: data.image ? String(data.image) : '',
    href: data.href ? String(data.href) : '#',
    crossIcon: data.crossIcon ? String(data.crossIcon) : 'images/cross.svg'
  };

  if (!newProduct.title || Number.isNaN(newProduct.price)) {
    return null;
  }

  products.push(newProduct);
  saveProducts();

  return cloneProduct(newProduct);
}

function updateProduct(id, data) {
  const productId = String(id);
  const productIndex = products.findIndex(function(item) {
    return String(item.id) === productId;
  });

  if (productIndex === -1) {
    return null;
  }

  const currentProduct = products[productIndex];
  const nextTitle = typeof data.title === 'undefined' ? currentProduct.title : String(data.title).trim();
  const nextPrice = typeof data.price === 'undefined' ? currentProduct.price : Number(data.price);

  if (!nextTitle || Number.isNaN(nextPrice)) {
    return null;
  }

  products[productIndex] = {
    id: currentProduct.id,
    title: nextTitle,
    price: nextPrice,
    image: typeof data.image === 'undefined' ? currentProduct.image : String(data.image),
    href: typeof data.href === 'undefined' ? currentProduct.href : String(data.href),
    crossIcon: typeof data.crossIcon === 'undefined' ? currentProduct.crossIcon : String(data.crossIcon)
  };

  saveProducts();

  return cloneProduct(products[productIndex]);
}

function deleteProduct(id) {
  const productId = String(id);
  const productIndex = products.findIndex(function(item) {
    return String(item.id) === productId;
  });

  if (productIndex === -1) {
    return null;
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  saveProducts();

  return cloneProduct(deletedProduct);
}

module.exports = {
  getAllProducts: getAllProducts,
  getProductById: getProductById,
  createProduct: createProduct,
  updateProduct: updateProduct,
  deleteProduct: deleteProduct
};
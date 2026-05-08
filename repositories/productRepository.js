const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '..', 'data', 'products.json');

function normalizeCategory(value) {
  return String(value || '').trim().toLowerCase();
}

function getProductCategory(product) {
  const title = normalizeCategory(product && product.title);

  if (/relax|lounge|comfort|recliner/.test(title)) {
    return 'lounge';
  }

  if (/executive|task|mesh|aero|office/.test(title)) {
    return 'office';
  }

  if (/dining|cushioned|classic|upholstered/.test(title)) {
    return 'dining';
  }

  if (/oak|wood|wooden|nordic|scandi/.test(title)) {
    return 'wooden';
  }

  if (/minimal|modern|studio|contemporary|accent/.test(title)) {
    return 'modern';
  }

  return 'accent';
}

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

function getAllProducts(category) {
  const normalizedCategory = normalizeCategory(category);
  const visibleProducts = normalizedCategory && normalizedCategory !== 'all'
    ? products.filter(function(product) {
        return getProductCategory(product) === normalizedCategory;
      })
    : products;

  return visibleProducts.map(cloneProduct);
}

function getProductById(id) {
  const productId = String(id);
  const product = products.find(function(item) {
    return String(item.id) === productId;
  });

  return product ? cloneProduct(product) : null;
}

function createProduct(data) {
  const newProduct = {
    id: getNextProductId(),
    title: String(data.title).trim(),
    price: Number(data.price),
    image: data.image ? String(data.image) : '',
    href: data.href ? String(data.href) : '#',
    crossIcon: data.crossIcon ? String(data.crossIcon) : 'images/cross.svg'
  };

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

  products[productIndex] = {
    id: currentProduct.id,
    title: typeof data.title === 'undefined' ? currentProduct.title : String(data.title).trim(),
    price: typeof data.price === 'undefined' ? currentProduct.price : Number(data.price),
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
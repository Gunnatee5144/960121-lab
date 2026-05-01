const productService = require('../services/productService');

function getProducts(request, response) {
  try {
    const products = productService.getAllProducts();
    response.json(products);
  } catch (error) {
    response.status(500).json({ message: 'Error retrieving products' });
  }
}

function getProduct(request, response) {
  try {
    const product = productService.getProductById(request.params.id);
    if (!product) {
      return response.status(404).json({ message: 'Product not found' });
    }
    return response.json(product);
  } catch (error) {
    response.status(500).json({ message: 'Error retrieving product' });
  }
}

function createProduct(request, response) {
  try {
    const createdProduct = productService.createProduct(request.body || {});
    if (!createdProduct) {
      return response.status(400).json({ message: 'title and price are required' });
    }
    return response.status(201).json(createdProduct);
  } catch (error) {
    response.status(500).json({ message: 'Error creating product' });
  }
}

function updateProduct(request, response) {
  try {
    const updatedProduct = productService.updateProduct(request.params.id, request.body || {});
    if (!updatedProduct) {
      return response.status(404).json({ message: 'Product not found' });
    }
    return response.json(updatedProduct);
  } catch (error) {
    response.status(500).json({ message: 'Error updating product' });
  }
}

function deleteProduct(request, response) {
  try {
    const deletedProduct = productService.deleteProduct(request.params.id);
    if (!deletedProduct) {
      return response.status(404).json({ message: 'Product not found' });
    }
    return response.status(204).send();
  } catch (error) {
    response.status(500).json({ message: 'Error deleting product' });
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};

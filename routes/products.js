const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// GET /api/products?category=wooden
// The controller reads the query string and decides whether to return the full
// catalog or only the matching category.
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
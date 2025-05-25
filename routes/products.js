const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

// Get all products
router.get("/", productController.getAllProducts);

// Add a new product
router.post("/", productController.createProduct);

// GET /api/products/featured
router.get("/featured", productController.getFeaturedProducts);

// Get products by category
router.get("/category/:category", productController.getProductsByCategory);

// Get product by ID
router.get("/:id", productController.getProductById);



module.exports = router;

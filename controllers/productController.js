const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.status(200).json({
    products,
    message: "Products fetched successfully",
  });
};

exports.createProduct = async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json({
    message: "Product created successfully",
    product,
  });
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }
  res.status(200).json({
    product,
    message: "Product fetched successfully",
  });
};

exports.getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(3);
  res.status(200).json({
    products,
    message: "Featured products fetched successfully",
  });
};

// Get all products in a specific category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryName = req.params.category;
    const products = await Product.find({ category: categoryName });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

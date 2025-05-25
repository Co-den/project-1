const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");




// Get all users (Admin only)
exports.getAllUsers =  async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access Denied" });

    const users = await User.find();
    res.json(users);
}

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Access Denied" });

    const orders = await Order.find().populate("userId", "name email");
    res.json(orders);
}

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Access Denied" });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = req.body.status;
  await order.save();
  res.json({ message: "Order updated successfully" });
}

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Access Denied" });

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await product.remove();
  res.json({ message: "Product deleted successfully" });
}

// Create a new order
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

  try {
    const newOrder = new Order({
      userId: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: "Pending",
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
}


// server.js (or routes/order.js)
const express = require("express");
const OrderController = require("../controllers/orderController");
const auth = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all orders (admin use)
router.get("/", OrderController.getAllOrders);

// Create Order
router.post("/", OrderController.createOrder);

// Update order status
router.put("/:id", OrderController.updateOrderStatus);

// Get orders by user
router.get("/user/:userId", auth.authenticateUser, OrderController.getUserOrders);

// Get order by ID
router.get("/payment/:paymentId", OrderController.getOrderByPaymentId);

//get order by userId
//router.get("/user/:userId", OrderController.getOrderByUserId);
// after payment
router.post(
  "/after-payment",
  auth.authenticateUser,
  OrderController.afterPayment
);

module.exports = router;

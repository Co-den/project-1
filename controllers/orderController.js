const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const { sendOrderConfirmationEmail } = require("../utils/email");
const { createInvoice } = require("../utils/invoiceGenerator");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, paymentId } =
      req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (!shippingAddress || typeof shippingAddress !== "string") {
      return res
        .status(400)
        .json({ message: "Shipping address must be a string" });
    }

    if (!paymentMethod || !paymentId) {
      return res.status(400).json({ message: "Payment details are required" });
    }

    const newOrder = new Order({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: "Completed", // Set automatically if payment succeeded
      paymentId,
    });

    const savedOrder = await newOrder.save();

    const user = await User.findById(userId);
    await sendOrderConfirmationEmail(user.email, savedOrder);
    await generateInvoicePDF(savedOrder, user.email);

    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: err.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.productId");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get all orders for a specific user
// This function is used to fetch all orders for a specific user
exports.getUserOrders = async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view these orders"
      });
    }

    const orders = await Order.find({ userId: req.params.userId })
      .populate({
        path: "items.productId",
        select: "name price image",
        model: "Product"
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


//update order status
// This function is used to update the status of an order
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

//afterPayment function
// This function is used to handle the payment confirmation and create an order
exports.afterPayment = async (req, res) => {
  try {
    // 1. Log incoming request and user data
    console.log("Received body:", req.body);
    console.log("Authenticated user ID:", req.user?._id);

    // 2. Destructure and validate required fields
    const { cartItems, totalAmount, billingDetails, paymentIntentId } =
      req.body;

    // Validate prices
    const isValid = cartItems.every(
      (item) => typeof item.price === "number" && item.price > 0
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid prices detected",
        details: cartItems.map((item) => ({
          productId: item.productId,
          price: item.price,
        })),
      });
    }

    if (!cartItems?.length || !paymentIntentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 3. Convert productIds to ObjectIds and validate numbers
    const validatedItems = cartItems.map((item) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    // 4. Safely build shipping address with fallbacks
    const shippingAddress = [
      billingDetails?.address?.line1 || "Address line1 not provided",
      billingDetails?.address?.city || "City not provided",
      billingDetails?.address?.postal_code || "Postal code not provided",
    ].join(", ");

    // 5. Create order with proper schema field names

    const order = await Order.create({
      userId: req.user._id, // Matches schema field name
      items: validatedItems,
      totalAmount: Number(totalAmount),
      shippingAddress,
      paymentMethod: "Card",
      paymentId: paymentIntentId, // Matches schema field name
    });

    // 6. Handle PDF and email with error suppression
    let invoice;
    try {
      invoice = await createInvoice(order);
      console.log(`Invoice generated successfully for order ${order._id}`);
    } catch (pdfError) {
      console.error(
        `PDF Generation Failed for ${order._id}:`,
        pdfError.message
      );
    }

    try {
      await sendOrderConfirmationEmail(req.user.email, order, invoice);
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    // 7. Send success response
    res.status(201).json({
      success: true,
      orderId: order._id,
      message: "Order created successfully",
    });
  } catch (error) {
    // 8. Enhanced error logging
    console.error("Order creation error:", {
      message: error.message,
      stack: error.stack,
      validationErrors: error.errors,
    });

    res.status(500).json({
      message: "Order processing failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please contact support",
    });
  }
};

exports.getOrderByPaymentId = async (req, res) => {
  try {
    const order = await Order.findOne({ paymentId: req.params.paymentId })
      .select("items totalAmount paymentId shippingAddress createdAt")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching order",
      error: error.message,
    });
  }
};

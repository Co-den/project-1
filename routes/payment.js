const express = require("express");
const stripePayment = require("../payment/Stripe");


const router = express.Router();

// Create a payment intent
router.post("/create-payment-intent", stripePayment.Checkout);
router.post("/stripe-webhook", stripePayment.webhook);


module.exports = router;
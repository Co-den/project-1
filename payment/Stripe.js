// server.js (or routes/payment.js)
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


exports.Checkout = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency || "usd",
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.webhook =  (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = "whsec_xxx"; // From Stripe dashboard

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle events (e.g., update order status in MongoDB)
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    // Update order status in MongoDB
  }

  res.status(200).end();
};
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const sharp = require("sharp");
dotenv.config({ path: "./config.env" });
const authRoute = require("./routes/auth");
const productRoute = require("./routes/products");
const orderRoute = require("./routes/orders");
const adminRoute = require("./routes/admin");
const paymentRoute = require("./routes/payment");


const app = express();
app.use(express.json());
// server.js

app.use(cors({
  origin: 'http://localhost:5173', // Your React dev server port
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
connectDB();
// Serve static images
app.use("/images", express.static("public/images"));

app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRoute);

// Add security middleware for image serving
app.use("/api/images", (req, res, next) => {
  // Validate requested path
  const sanitizedPath = req.path.replace(/[^a-zA-Z0-9/-]/g, "");
  if (req.path !== sanitizedPath) {
    return res.status(400).send("Invalid image path");
  }
  next();
});

app.get("/api/images/:type/:image", (req, res) => {
  const { type, image } = req.params;
  const width = parseInt(req.query.w) || 800;
  const quality = parseInt(req.query.q) || 75;

  // Process image with sharp
  sharp(`public/images/${type}/${image}`)
    .resize(width)
    .jpeg({ quality })
    .toBuffer()
    .then((data) => {
      res.set("Content-Type", "image/jpeg");
      res.send(data);
    });
});

app.use((err, req, res, next) => {
  console.error('Global Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

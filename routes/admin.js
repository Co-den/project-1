const express = require("express");
const auth = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.get("/admin/dashboard", auth.authenticateUser, (req, res) => {
  res
    .status(200)
    .json({ message: "Welcome to Admin Dashboard", admin: req.user });
});

router.get("/users", auth.authenticateUser, adminController.getAllUsers);

router.get("/orders", auth.authenticateUser, adminController.getAllOrders);

router.put(
  "/orders/:id",
  auth.authenticateUser,
  adminController.updateOrderStatus
);

router.delete(
  "/products/:id",
  auth.authenticateUser,
  adminController.deleteProduct
);

router.post("/create", auth.authenticateUser, adminController.createOrder);

module.exports = router;

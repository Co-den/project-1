const express = require("express");
const bookingController = require("../controllers/bookingController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/booking", auth.authenticateUser, bookingController.createBooking);

module.exports = router;
const express = require("express");
const Booking = require("../models/Booking.js");

// POST /api/booking
exports.createBooking = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ error: "Name, email, and phone are required" });
    }

    const booking = new Booking({
      name,
      email,
      phone,
      message,
      date: new Date(),
    });

    await booking.save();

    res
      .status(201)
      .json({ success: true, message: "Booking saved successfully" });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

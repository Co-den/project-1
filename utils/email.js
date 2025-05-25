const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();


exports.sendOrderConfirmationEmail = async (email, order, invoice) => {
  try {
    if (!process.env.GMAIL_USERNAME || !process.env.GMAIL_PASSWORD) {
      throw new Error("Email service credentials not configured");
    }

    if (!email || !order) {
      throw new Error("Missing email or order data");
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const itemsList = order.items
      .map(
        (item) => `
        <li>
          Product ID: ${item.productId} <br />
          Quantity: ${item.quantity} <br />
          Price: $${item.price}
        </li>
      `
      )
      .join("");

    const mailOptions = {
      from: `"🐔Agrify" <${process.env.GMAIL_USERNAME}>`,
      to: email,
      subject: "Order Confirmation",
      html: `<h3>Thanks for your order!</h3>
        <p>Order ID: <strong>${order._id}</strong></p>
        <p>Total: <strong>$${order.totalAmount}</strong></p>
        <p>Shipping Address: ${order.shippingAddress}</p>
        <p>Payment Method: ${order.paymentMethod}</p>
        <h3>Items</h3>
        <ul>${itemsList}</ul>
        <p>We’ll get back to you with shipping updates.</p>
        <p>Your invoice is attached to this email.</p>`,
      attachments: invoice
        ? [
            {
              filename: invoice.filename,
              content: invoice.content,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Email Failed for Order ${order._id}:`, error.message);
    throw error;
  }
};

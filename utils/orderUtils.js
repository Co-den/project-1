// utils/orderUtils.js
const fs = require('fs');
const path = require('path');

const ensureInvoicesDir = () => {
  const dir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

exports.generateInvoicePDF = async (order) => {
  try {
    ensureInvoicesDir(); // Create directory if needed
    const invoicePath = path.join(__dirname, `../invoices/invoice-${order._id}.pdf`);
    
    // Add PDF generation logic here
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));
    
    // Fix "Cannot read forEach" error
    order.items?.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.productId} - Qty: ${item.quantity} - $${item.price}`);
    });
    
    doc.end();
  } catch (error) {
    console.error(`PDF Generation Failed for Order ${order._id}:`, error);
    throw error;
  }
};
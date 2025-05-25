// utils/invoiceGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const createInvoice = (order) => {
  try {
    // Create invoice directory if not exists
    const invoiceDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // Configure PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const invoicePath = path.join(invoiceDir, `invoice-${order._id}.pdf`);
    const writeStream = fs.createWriteStream(invoicePath);
    
    // Pipe PDF content
    doc.pipe(writeStream);

    // Add header
    doc.fontSize(26).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Order details
    doc.fontSize(14)
      .text(`Order ID: ${order._id}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .moveDown();

    // Customer information
    doc.text(`Customer: ${order.userId}`, { continued: true })
      .text(`Shipping Address: ${order.shippingAddress}`, { align: 'right' })
      .moveDown();

    // Items table header
    doc.font('Helvetica-Bold')
      .text('Product ID', 50, 200)
      .text('Quantity', 250)
      .text('Price', 350, 200, { align: 'right' })
      .font('Helvetica');

    // Items list
    let y = 230;
    order.items.forEach((item, index) => {
      doc.text(item.productId.toString(), 50, y)
        .text(item.quantity.toString(), 250, y)
        .text(`$${item.price.toFixed(2)}`, 350, y, { align: 'right' });
      y += 30;
    });

    // Total amount
    doc.moveTo(50, y + 20)
      .lineTo(550, y + 20)
      .stroke()
      .font('Helvetica-Bold')
      .text('Total Amount:', 350, y + 30)
      .text(`$${order.totalAmount.toFixed(2)}`, 350, y + 30, { align: 'right' });

    // Finalize PDF
    doc.end();
    
    return invoicePath;
  } catch (error) {
    console.error(`Invoice generation failed for order ${order._id}:`, error);
    throw new Error('Failed to generate invoice');
  }
};

module.exports = { createInvoice };
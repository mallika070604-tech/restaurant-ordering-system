import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const invoicesDir = path.join(__dirname, '../../invoices');

export const ensureInvoicesDir = () => {
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
};

export const generateInvoice = async (order) => {
  ensureInvoicesDir();

  const filename = `${order.orderNumber}.pdf`;
  const filepath = path.join(invoicesDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    stream.on('finish', () => resolve(filepath));
    stream.on('error', reject);

    doc.pipe(stream);

    const restaurantName = process.env.RESTAURANT_NAME || 'Restaurant';
    const address = process.env.RESTAURANT_ADDRESS || '';
    const phone = process.env.RESTAURANT_PHONE || '';

    doc.fontSize(22).text(restaurantName, { align: 'center' });
    doc.fontSize(10).text(address, { align: 'center' });
    doc.text(phone, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('TAX INVOICE', { align: 'center', underline: true });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Invoice #: ${order.orderNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString('en-IN')}`);
    doc.text(`Table: ${order.tableNumber}`);
    doc.text(`Payment: ${order.paymentStatus.toUpperCase()}`);
    doc.moveDown();

    doc.fontSize(11).text('Items', { underline: true });
    doc.moveDown(0.5);

    order.items.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      doc.text(`${item.name} x${item.quantity}`, { continued: true });
      doc.text(`₹${lineTotal.toFixed(2)}`, { align: 'right' });
      if (item.notes) {
        doc.fontSize(9).fillColor('#666').text(`  Note: ${item.notes}`);
        doc.fillColor('#000').fontSize(10);
      }
    });

    doc.moveDown();
    doc.text(`Subtotal`, { continued: true });
    doc.text(`₹${order.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax (5%)`, { continued: true });
    doc.text(`₹${order.tax.toFixed(2)}`, { align: 'right' });
    doc.fontSize(12).text(`Total`, { continued: true });
    doc.text(`₹${order.total.toFixed(2)}`, { align: 'right' });

    if (order.razorpayPaymentId) {
      doc.moveDown();
      doc.fontSize(9).text(`Payment ID: ${order.razorpayPaymentId}`);
    }

    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for dining with us!', { align: 'center' });

    doc.end();
  });
};

export const getInvoicePath = (orderNumber) => path.join(invoicesDir, `${orderNumber}.pdf`);

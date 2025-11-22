import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReceiptPDF = async (receipt, items, warehouse) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `receipt-${receipt.receiptId}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      const stream = fs.createWriteStream(filepath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('STOCKMASTER IMS', { align: 'center' });
      doc.fontSize(16).text('RECEIPT', { align: 'center' });
      doc.moveDown();

      // Receipt Details
      doc.fontSize(12);
      doc.text(`Receipt ID: ${receipt.receiptId}`, 50, 120);
      doc.text(`Supplier: ${receipt.supplier}`, 50, 140);
      doc.text(`Warehouse: ${warehouse.name}`, 50, 160);
      doc.text(`Status: ${receipt.status}`, 50, 180);
      doc.text(`Date: ${new Date(receipt.createdAt).toLocaleDateString()}`, 50, 200);
      doc.text(`Created By: ${receipt.createdBy.name}`, 50, 220);

      // Items Table
      let y = 280;
      doc.fontSize(14).text('Items:', 50, y);
      y += 30;

      // Table Header
      doc.fontSize(10);
      doc.text('Product', 50, y);
      doc.text('SKU', 200, y);
      doc.text('Quantity', 300, y);
      doc.text('Unit Price', 400, y);
      doc.text('Total', 480, y);
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      // Table Rows
      let total = 0;
      items.forEach((item) => {
        const itemTotal = (item.unitPrice || 0) * item.quantity;
        total += itemTotal;

        doc.text(item.product.name, 50, y);
        doc.text(item.product.sku, 200, y);
        doc.text(item.quantity.toString(), 300, y);
        doc.text(item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-', 400, y);
        doc.text(item.unitPrice ? `$${itemTotal.toFixed(2)}` : '-', 480, y);
        y += 20;
      });

      y += 10;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 20;

      if (items.some(item => item.unitPrice)) {
        doc.fontSize(12).text(`Total: $${total.toFixed(2)}`, 400, y);
      }

      // QR Code
      try {
        const qrData = await QRCode.toDataURL(receipt.receiptId);
        doc.image(qrData, 450, 100, { width: 80, height: 80 });
      } catch (err) {
        console.error('QR Code generation error:', err);
      }

      // Footer
      doc.fontSize(8)
        .text('This is a computer-generated document.', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const generateDeliveryPDF = async (delivery, items, warehouse) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `delivery-${delivery.deliveryId}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      const stream = fs.createWriteStream(filepath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('STOCKMASTER IMS', { align: 'center' });
      doc.fontSize(16).text('DELIVERY ORDER', { align: 'center' });
      doc.moveDown();

      // Delivery Details
      doc.fontSize(12);
      doc.text(`Delivery ID: ${delivery.deliveryId}`, 50, 120);
      doc.text(`Customer: ${delivery.customer}`, 50, 140);
      doc.text(`Warehouse: ${warehouse.name}`, 50, 160);
      doc.text(`Status: ${delivery.status}`, 50, 180);
      doc.text(`Date: ${new Date(delivery.createdAt).toLocaleDateString()}`, 50, 200);
      doc.text(`Created By: ${delivery.createdBy.name}`, 50, 220);

      // Items Table
      let y = 280;
      doc.fontSize(14).text('Items:', 50, y);
      y += 30;

      // Table Header
      doc.fontSize(10);
      doc.text('Product', 50, y);
      doc.text('SKU', 200, y);
      doc.text('Quantity', 300, y);
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      // Table Rows
      items.forEach((item) => {
        doc.text(item.product.name, 50, y);
        doc.text(item.product.sku, 200, y);
        doc.text(item.quantity.toString(), 300, y);
        y += 20;
      });

      y += 10;
      doc.moveTo(50, y).lineTo(550, y).stroke();

      // QR Code
      try {
        const qrData = await QRCode.toDataURL(delivery.deliveryId);
        doc.image(qrData, 450, 100, { width: 80, height: 80 });
      } catch (err) {
        console.error('QR Code generation error:', err);
      }

      // Footer
      doc.fontSize(8)
        .text('This is a computer-generated document.', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const generateTransferPDF = async (transfer, items, fromWarehouse, toWarehouse) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `transfer-${transfer.transferId}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      const stream = fs.createWriteStream(filepath);
      
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('STOCKMASTER IMS', { align: 'center' });
      doc.fontSize(16).text('INTERNAL TRANSFER', { align: 'center' });
      doc.moveDown();

      // Transfer Details
      doc.fontSize(12);
      doc.text(`Transfer ID: ${transfer.transferId}`, 50, 120);
      doc.text(`From: ${fromWarehouse.name}`, 50, 140);
      doc.text(`To: ${toWarehouse.name}`, 50, 160);
      doc.text(`Status: ${transfer.status}`, 50, 180);
      doc.text(`Date: ${new Date(transfer.createdAt).toLocaleDateString()}`, 50, 200);
      if (transfer.notes) {
        doc.text(`Notes: ${transfer.notes}`, 50, 220);
      }

      // Items Table
      let y = 280;
      doc.fontSize(14).text('Items:', 50, y);
      y += 30;

      doc.fontSize(10);
      doc.text('Product', 50, y);
      doc.text('SKU', 200, y);
      doc.text('Quantity', 300, y);
      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      items.forEach((item) => {
        doc.text(item.product.name, 50, y);
        doc.text(item.product.sku, 200, y);
        doc.text(item.quantity.toString(), 300, y);
        y += 20;
      });

      y += 10;
      doc.moveTo(50, y).lineTo(550, y).stroke();

      // QR Code
      try {
        const qrData = await QRCode.toDataURL(transfer.transferId);
        doc.image(qrData, 450, 100, { width: 80, height: 80 });
      } catch (err) {
        console.error('QR Code generation error:', err);
      }

      doc.fontSize(8)
        .text('This is a computer-generated document.', 50, doc.page.height - 50, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ filename, filepath });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};




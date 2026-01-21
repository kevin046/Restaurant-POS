import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from 'lucide-react';
import { format } from 'date-fns';

export default function PrintReceiptModal({ 
  open, 
  onClose, 
  order,
  table,
  onPrintConfirm
}) {
  const receiptRef = useRef(null);

  const subtotal = order?.items?.reduce((sum, item) => 
    sum + (item.price * item.quantity * (item.is_comped ? 0 : 1)), 0
  ) || 0;
  const discount = order?.discount || 0;
  const tax = (subtotal - discount) * 0.13;
  const total = subtotal - discount + tax;

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .items { margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .modifier { font-size: 0.85em; color: #666; padding-left: 10px; }
            .totals { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
            .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    if (onPrintConfirm) {
      onPrintConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Receipt
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div className="bg-white rounded-lg p-4 text-black font-mono text-sm">
          <div ref={receiptRef}>
            <div className="header">
              <h2 className="text-lg font-bold">RestaurantFlow POS</h2>
              <p className="text-xs">123 Main Street</p>
              <p className="text-xs">Tel: (555) 123-4567</p>
              <p className="text-xs mt-2">{format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
            </div>

            <div className="my-3 text-center">
              <span className="font-bold">{table?.name || 'Take Out'}</span>
              <span className="mx-2">•</span>
              <span>Server: {order?.server?.split('@')[0] || 'N/A'}</span>
            </div>

            <div className="items">
              {order?.items?.map((item, i) => (
                <div key={i}>
                  <div className="item">
                    <span>{item.quantity}x {item.name} {item.is_comped && '(COMP)'}</span>
                    <span>${(item.price * item.quantity * (item.is_comped ? 0 : 1)).toFixed(2)}</span>
                  </div>
                  {item.modifiers?.map((mod, j) => (
                    <div key={j} className="modifier">• {mod}</div>
                  ))}
                </div>
              ))}
            </div>

            <div className="totals">
              <div className="total-line">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="total-line text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="total-line">
                <span>Tax (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="grand-total total-line">
                <span>TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="footer">
              <p>Thank you for dining with us!</p>
              <p className="text-xs mt-2">Order #{order?.id?.slice(-6)}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
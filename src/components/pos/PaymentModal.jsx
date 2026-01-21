import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CreditCard, Banknote, Gift, Split, Calculator,
  CheckCircle, Loader2, Receipt, Percent, Users, GripVertical
} from 'lucide-react';

const tipPresets = [10, 15, 18, 20];

export default function PaymentModal({ open, onClose, order, onProcessPayment }) {
  const [method, setMethod] = useState('credit');
  const [tipPercent, setTipPercent] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);
  const [tipBasis, setTipBasis] = useState('before_tax'); // 'before_tax' | 'after_tax'

  // Split Logic
  const [splitMode, setSplitMode] = useState(false);
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'item'
  const [splitCount, setSplitCount] = useState(2);
  const [itemAssignments, setItemAssignments] = useState({}); // { uniqueId: personId }
  const [selectedPayer, setSelectedPayer] = useState(1);
  const [draggedItem, setDraggedItem] = useState(null);
  const lastOrderId = useRef(order?.id);

  // Initialize item assignments when order changes or split mode activates
  const [explodedItems, setExplodedItems] = useState([]);

  useEffect(() => {
    if (order?.items) {
      const exploded = [];
      order.items.forEach((item, index) => {
        // Calculate remaining quantity
        const paidQty = item.paid_quantity || 0;
        const remainingQty = item.quantity - paidQty;

        for (let i = 0; i < remainingQty; i++) {
          exploded.push({
            ...item,
            // Offset uniqueId by paidQty to ensure uniqueness across payments
            uniqueId: `${index}-${i + paidQty}`,
            originalIndex: index,
            singlePrice: item.price
          });
        }
      });
      setExplodedItems(exploded);

      setItemAssignments(prev => {
        // If order ID changed, reset assignments
        if (order.id !== lastOrderId.current) {
          lastOrderId.current = order.id;
          const reset = {};
          exploded.forEach(item => {
            reset[item.uniqueId] = 0;
          });
          return reset;
        }

        // Otherwise merge with existing assignments (preserve un-paid assignments)
        const next = { ...prev };
        exploded.forEach(item => {
          if (next[item.uniqueId] === undefined) {
            next[item.uniqueId] = 0;
          }
        });
        return next;
      });
    }
  }, [order, open]);

  const subtotal = order?.subtotal || (order?.items || []).reduce((sum, item) => sum + (item.price * item.quantity * (item.is_comped ? 0 : 1)), 0);
  const taxRate = 0.13;

  // Calculate totals based on split mode
  let paymentAmount = 0;
  let paymentTax = 0;

  if (!splitMode) {
    paymentAmount = subtotal;
    paymentTax = subtotal * taxRate;
  } else if (splitType === 'equal') {
    paymentAmount = subtotal / splitCount;
    paymentTax = (subtotal * taxRate) / splitCount;
  } else {
    // Split by item
    // Calculate total for selected payer
    const payerItems = explodedItems.filter(item => (itemAssignments[item.uniqueId] || 0) === selectedPayer);
    const payerSubtotal = payerItems.reduce((sum, item) => sum + item.singlePrice, 0);
    paymentAmount = payerSubtotal;
    paymentTax = payerSubtotal * taxRate;
  }

  const basisAmount = tipBasis === 'before_tax' ? paymentAmount : (paymentAmount + paymentTax);
  const tipAmount = customTip ? parseFloat(customTip) : (basisAmount * tipPercent / 100);
  const total = paymentAmount + paymentTax + tipAmount;

  const cashChange = cashReceived ? parseFloat(cashReceived) - total : 0;

  // Drag and Drop Handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.uniqueId); // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, personId) => {
    e.preventDefault();
    if (draggedItem) {
      setItemAssignments(prev => ({
        ...prev,
        [draggedItem.uniqueId]: personId
      }));
      setDraggedItem(null);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate processing

    const paymentData = {
      method,
      amount: total,
      tip: tipAmount,
      split: splitMode ? {
        type: splitType,
        count: splitCount,
        amount: total,
        payer: splitType === 'item' ? selectedPayer : null,
        items: splitType === 'item' ? explodedItems.filter(item => itemAssignments[item.uniqueId] === selectedPayer) : null
      } : null,
      isPartial: splitMode // If split mode is on, it's likely a partial payment
    };

    await onProcessPayment(paymentData);

    setProcessing(false);
  };

  // Helper to get person total
  const getPersonTotal = (personId) => {
    const items = explodedItems.filter(item => (itemAssignments[item.uniqueId] || 0) === personId);
    const sub = items.reduce((sum, item) => sum + item.singlePrice, 0);
    return sub * (1 + taxRate);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side: Split Interface (if enabled) or Order Summary */}
          <div className={cn(
            "flex-1 border-r border-slate-800 flex flex-col overflow-hidden transition-all",
            splitMode ? "w-2/3" : "w-0 hidden"
          )}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Button
                  variant={splitType === 'equal' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSplitType('equal')}
                >
                  Equal Split
                </Button>
                <Button
                  variant={splitType === 'item' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSplitType('item')}
                >
                  Split by Item
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Guests:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center text-white">{splitCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSplitCount(splitCount + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950/50 p-4">
              {splitType === 'equal' ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-10 h-10 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400">Bill split equally between</p>
                    <p className="text-2xl font-bold text-white">{splitCount} Guests</p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-6 min-w-[200px]">
                    <p className="text-slate-500 mb-1">Each pays</p>
                    <p className="text-3xl font-bold text-emerald-400">${(total / splitCount).toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col gap-4">
                  {/* Unassigned Items */}
                  <div
                    className="bg-slate-800/40 rounded-xl p-4 min-h-[100px] border-2 border-dashed border-slate-700 transition-colors hover:border-slate-600"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 0)}
                  >
                    <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center justify-between">
                      <span>Unassigned Items</span>
                      <span className="bg-slate-700 text-white px-2 py-0.5 rounded-full text-xs">
                        {explodedItems.filter(i => !itemAssignments[i.uniqueId]).length}
                      </span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {explodedItems.filter(item => !itemAssignments[item.uniqueId]).map(item => (
                        <div
                          key={item.uniqueId}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm cursor-move hover:bg-slate-600 active:cursor-grabbing flex items-center gap-2 shadow-sm"
                        >
                          <GripVertical className="w-3 h-3 text-slate-500" />
                          {item.name}
                          <span className="text-emerald-400 text-xs ml-1">${item.singlePrice}</span>
                        </div>
                      ))}
                      {explodedItems.filter(i => !itemAssignments[i.uniqueId]).length === 0 && (
                        <p className="text-slate-600 text-sm italic w-full text-center py-2">All items assigned</p>
                      )}
                    </div>
                  </div>

                  {/* People Columns */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
                    {Array.from({ length: splitCount }, (_, i) => i + 1).map(personId => (
                      <div
                        key={personId}
                        className={cn(
                          "bg-slate-800/40 rounded-xl p-3 border-2 transition-all flex flex-col",
                          selectedPayer === personId
                            ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/50"
                            : "border-slate-700 hover:border-slate-600",
                          // Highlight drop target
                          draggedItem && "border-dashed"
                        )}
                        onClick={() => setSelectedPayer(personId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, personId)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "font-bold text-sm",
                            selectedPayer === personId ? "text-emerald-400" : "text-white"
                          )}>
                            Person {personId}
                          </span>
                          <span className="text-xs text-slate-500">
                            ${getPersonTotal(personId).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex-1 space-y-2 min-h-[50px]">
                          {explodedItems.filter(item => itemAssignments[item.uniqueId] === personId).map(item => (
                            <div
                              key={item.uniqueId}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item)}
                              className="bg-slate-700/50 text-slate-200 px-2 py-1.5 rounded text-xs cursor-move hover:bg-slate-700 flex justify-between items-center group"
                            >
                              <span className="truncate flex-1">{item.name}</span>
                              <span className="text-emerald-500/70 ml-2">${item.singlePrice}</span>
                            </div>
                          ))}
                        </div>

                        {selectedPayer === personId && (
                          <div className="mt-2 text-center text-xs text-emerald-400 font-medium bg-emerald-500/10 py-1 rounded">
                            Paying Now
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Payment Details */}
          <div className={cn(
            "flex flex-col overflow-hidden bg-slate-900",
            splitMode ? "w-1/3 border-l border-slate-800" : "w-full"
          )}>
            <div className="p-6 space-y-6 overflow-y-auto">
              <Tabs value={method} onValueChange={setMethod} className="w-full">
                <TabsList className="grid grid-cols-4 bg-slate-800">
                  <TabsTrigger value="credit" className="data-[state=active]:bg-slate-700">
                    <CreditCard className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Credit</span>
                  </TabsTrigger>
                  <TabsTrigger value="debit" className="data-[state=active]:bg-slate-700">
                    <CreditCard className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Debit</span>
                  </TabsTrigger>
                  <TabsTrigger value="cash" className="data-[state=active]:bg-slate-700">
                    <Banknote className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Cash</span>
                  </TabsTrigger>
                  <TabsTrigger value="gift" className="data-[state=active]:bg-slate-700">
                    <Gift className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Gift</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-6">
                  {/* Summary */}
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                    {!splitMode && (
                      <>
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Tax (13%)</span>
                          <span>${(subtotal * taxRate).toFixed(2)}</span>
                        </div>
                      </>
                    )}

                    {splitMode && (
                      <div className="flex justify-between text-blue-400 pb-2 border-b border-slate-700/50">
                        <span>
                          {splitType === 'equal'
                            ? `Split (1/${splitCount})`
                            : `Person ${selectedPayer}'s Share`
                          }
                        </span>
                        <span>${paymentAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Tip Selection */}
                    {(method === 'credit' || method === 'debit') && (
                      <div className="pt-2 border-t border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-slate-400 text-sm">Add Tip</Label>
                          <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-[10px]">
                            <button
                              className={cn("px-2 py-1 rounded transition-colors", tipBasis === 'before_tax' ? "bg-slate-700 text-white font-medium shadow-sm" : "text-slate-500 hover:text-slate-300")}
                              onClick={() => setTipBasis('before_tax')}
                            >Before Tax</button>
                            <button
                              className={cn("px-2 py-1 rounded transition-colors", tipBasis === 'after_tax' ? "bg-slate-700 text-white font-medium shadow-sm" : "text-slate-500 hover:text-slate-300")}
                              onClick={() => setTipBasis('after_tax')}
                            >After Tax</button>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {tipPresets.map(percent => (
                            <Button
                              key={percent}
                              variant="outline"
                              size="sm"
                              className={cn(
                                "flex-1 border-slate-700",
                                tipPercent === percent && !customTip
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "text-slate-400 hover:bg-slate-800"
                              )}
                              onClick={() => { setTipPercent(percent); setCustomTip(''); }}
                            >
                              {percent}%
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-slate-500 text-sm">Custom:</span>
                          <Input
                            type="number"
                            value={customTip}
                            onChange={(e) => setCustomTip(e.target.value)}
                            placeholder="$0.00"
                            className="bg-slate-800 border-slate-700 text-white w-24 h-8"
                          />
                        </div>
                        <div className="flex justify-between text-emerald-400 mt-2">
                          <span>Tip ({tipBasis === 'before_tax' ? 'Pre-Tax' : 'Post-Tax'})</span>
                          <span>${tipAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-700">
                      <span>Total to Pay</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Cash Received */}
                  <TabsContent value="cash" className="mt-0">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-slate-400">Cash Received</Label>
                        <Input
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder="0.00"
                          className="bg-slate-800 border-slate-700 text-white text-2xl h-14 mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[20, 50, 100, 'Exact'].map(amount => (
                          <Button
                            key={amount}
                            variant="outline"
                            className="border-slate-700 text-slate-400 hover:bg-slate-800"
                            onClick={() => setCashReceived(amount === 'Exact' ? total.toFixed(2) : String(amount))}
                          >
                            {amount === 'Exact' ? 'Exact' : `$${amount}`}
                          </Button>
                        ))}
                      </div>
                      {cashReceived && cashChange >= 0 && (
                        <div className="bg-emerald-600/20 rounded-xl p-4 text-center">
                          <span className="text-emerald-400 text-sm">Change Due</span>
                          <p className="text-3xl font-bold text-white">${cashChange.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Split Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Split className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400 text-sm">Split Bill</span>
                    </div>
                    <Button
                      variant={splitMode ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        splitMode
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "border-slate-700 text-slate-400"
                      )}
                      onClick={() => setSplitMode(!splitMode)}
                    >
                      {splitMode ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 mt-auto">
              <Button
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-semibold"
                onClick={handlePayment}
                disabled={processing || (method === 'cash' && (!cashReceived || cashChange < 0)) || (splitMode && splitType === 'item' && paymentAmount === 0)}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {splitMode
                      ? `Pay ${splitType === 'item' ? `Person ${selectedPayer}` : 'Share'}`
                      : 'Complete Payment'
                    }
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
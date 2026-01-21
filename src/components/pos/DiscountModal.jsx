import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Percent, DollarSign, Check } from 'lucide-react';

const presetDiscounts = [10, 15, 20, 25, 50];

export default function DiscountModal({ 
  open, 
  onClose, 
  orderTotal,
  onApplyDiscount 
}) {
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [reason, setReason] = useState('');

  const calculatedDiscount = discountType === 'percent' 
    ? (orderTotal * (parseFloat(discountValue) || 0) / 100)
    : parseFloat(discountValue) || 0;

  const handleApply = () => {
    if (discountValue && calculatedDiscount > 0) {
      onApplyDiscount({
        type: discountType,
        value: parseFloat(discountValue),
        amount: calculatedDiscount,
        reason
      });
      setDiscountValue('');
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Apply Discount
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Discount Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={discountType === 'percent' ? 'default' : 'outline'}
              className={cn(
                "flex-1",
                discountType === 'percent' 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "border-slate-700 text-slate-400"
              )}
              onClick={() => setDiscountType('percent')}
            >
              <Percent className="w-4 h-4 mr-2" />
              Percentage
            </Button>
            <Button
              variant={discountType === 'fixed' ? 'default' : 'outline'}
              className={cn(
                "flex-1",
                discountType === 'fixed' 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "border-slate-700 text-slate-400"
              )}
              onClick={() => setDiscountType('fixed')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Fixed Amount
            </Button>
          </div>

          {/* Preset Percentages */}
          {discountType === 'percent' && (
            <div className="flex gap-2">
              {presetDiscounts.map(percent => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 border-slate-700",
                    discountValue === String(percent)
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  )}
                  onClick={() => setDiscountValue(String(percent))}
                >
                  {percent}%
                </Button>
              ))}
            </div>
          )}

          {/* Custom Value */}
          <div>
            <Label className="text-slate-400">
              {discountType === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
            </Label>
            <div className="relative mt-1">
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="0"
                className="bg-slate-800 border-slate-700 text-white text-2xl h-14 pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                {discountType === 'percent' ? '%' : '$'}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label className="text-slate-400">Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Manager approval, customer complaint, etc."
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
          </div>

          {/* Preview */}
          {calculatedDiscount > 0 && (
            <div className="bg-emerald-600/20 rounded-xl p-4 text-center">
              <span className="text-emerald-400 text-sm">Discount Amount</span>
              <p className="text-3xl font-bold text-white">-${calculatedDiscount.toFixed(2)}</p>
              <p className="text-slate-400 text-sm mt-1">
                New Total: ${(orderTotal - calculatedDiscount).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
            Cancel
          </Button>
          <Button 
            onClick={handleApply}
            disabled={!discountValue || calculatedDiscount <= 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Coffee, Check } from 'lucide-react';

const compReasons = [
  'Customer complaint',
  'Quality issue',
  'Wrong order',
  'Manager comp',
  'VIP guest',
  'Birthday'
];

export default function CompItemModal({ 
  open, 
  onClose, 
  items,
  onCompItems 
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const toggleItem = (index) => {
    setSelectedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleComp = () => {
    if (selectedItems.length > 0 && (reason || customReason)) {
      onCompItems(selectedItems, reason || customReason);
      setSelectedItems([]);
      setReason('');
      setCustomReason('');
      onClose();
    }
  };

  const totalCompValue = selectedItems.reduce((sum, idx) => {
    const item = items[idx];
    return sum + (item?.price * item?.quantity || 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Comp Items
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item Selection */}
          <div>
            <Label className="text-slate-400">Select Items to Comp</Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-auto">
              {items?.map((item, index) => (
                <div
                  key={index}
                  onClick={() => toggleItem(index)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                    selectedItems.includes(index)
                      ? "bg-rose-500/20 border border-rose-500/50"
                      : "bg-slate-800/50 border border-slate-700 hover:border-slate-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={selectedItems.includes(index)}
                      className="border-slate-600"
                    />
                    <div>
                      <span className="text-white font-medium">{item.quantity}x {item.name}</span>
                      {item.is_comped && (
                        <span className="text-xs text-rose-400 ml-2">(Already comped)</span>
                      )}
                    </div>
                  </div>
                  <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <Label className="text-slate-400">Reason</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {compReasons.map(r => (
                <Button
                  key={r}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-slate-700",
                    reason === r
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  )}
                  onClick={() => { setReason(r); setCustomReason(''); }}
                >
                  {r}
                </Button>
              ))}
            </div>
            <Textarea
              value={customReason}
              onChange={(e) => { setCustomReason(e.target.value); setReason(''); }}
              placeholder="Or enter custom reason..."
              className="bg-slate-800 border-slate-700 text-white mt-2"
            />
          </div>

          {/* Preview */}
          {selectedItems.length > 0 && (
            <div className="bg-rose-600/20 rounded-xl p-4 text-center">
              <span className="text-rose-400 text-sm">{selectedItems.length} item(s) comped</span>
              <p className="text-3xl font-bold text-white">-${totalCompValue.toFixed(2)}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
            Cancel
          </Button>
          <Button 
            onClick={handleComp}
            disabled={selectedItems.length === 0 || (!reason && !customReason)}
            className="bg-rose-600 hover:bg-rose-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Comp Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
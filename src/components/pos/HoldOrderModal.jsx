import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Clock, Check, Play } from 'lucide-react';

const holdReasons = [
  'Waiting for guest',
  'Kitchen delay',
  'Special request',
  'VIP timing',
  'Large party'
];

export default function HoldOrderModal({ 
  open, 
  onClose, 
  order,
  onHoldOrder,
  onResumeOrder
}) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const isOnHold = order?.status === 'hold';

  const handleHold = () => {
    if (reason || customReason) {
      onHoldOrder(reason || customReason);
      setReason('');
      setCustomReason('');
      onClose();
    }
  };

  const handleResume = () => {
    onResumeOrder();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {isOnHold ? 'Resume Order' : 'Hold Order'}
          </DialogTitle>
        </DialogHeader>

        {isOnHold ? (
          <div className="py-4 space-y-4">
            <div className="bg-amber-600/20 rounded-xl p-4 text-center">
              <span className="text-amber-400 text-sm">Currently On Hold</span>
              <p className="text-white mt-2">{order?.hold_reason || 'No reason specified'}</p>
            </div>
            
            <Button 
              onClick={handleResume}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume Order
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Reason Selection */}
            <div>
              <Label className="text-slate-400">Reason for Hold</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {holdReasons.map(r => (
                  <Button
                    key={r}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "border-slate-700",
                      reason === r
                        ? "bg-amber-600 border-amber-600 text-white"
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

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
                Cancel
              </Button>
              <Button 
                onClick={handleHold}
                disabled={!reason && !customReason}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Put On Hold
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
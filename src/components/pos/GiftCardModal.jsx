import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Gift, CreditCard, Check, Search, Loader2, AlertCircle } from 'lucide-react';

const giftCardAmounts = [25, 50, 75, 100, 150, 200];

export default function GiftCardModal({ 
  open, 
  onClose, 
  onPurchaseGiftCard,
  onRedeemGiftCard,
  onCheckBalance
}) {
  const [activeTab, setActiveTab] = useState('purchase');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');

  const selectedAmount = customAmount || amount;

  const handlePurchase = () => {
    if (selectedAmount) {
      onPurchaseGiftCard({
        amount: parseFloat(selectedAmount),
        recipientName,
        recipientEmail
      });
      resetForm();
      onClose();
    }
  };

  const handleCheckBalance = async () => {
    if (!redeemCode) return;
    setChecking(true);
    setError('');
    setBalance(null);
    
    const result = await onCheckBalance(redeemCode);
    
    if (result.error) {
      setError(result.error);
    } else {
      setBalance(result.balance);
    }
    setChecking(false);
  };

  const handleRedeem = () => {
    if (redeemCode && balance > 0) {
      onRedeemGiftCard(redeemCode, balance);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setAmount('');
    setCustomAmount('');
    setRecipientName('');
    setRecipientEmail('');
    setRedeemCode('');
    setBalance(null);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onClose(); }}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Gift Card
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 bg-slate-800">
            <TabsTrigger value="purchase" className="data-[state=active]:bg-slate-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Purchase
            </TabsTrigger>
            <TabsTrigger value="redeem" className="data-[state=active]:bg-slate-700">
              <Gift className="w-4 h-4 mr-2" />
              Redeem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-4 mt-4">
            {/* Amount Selection */}
            <div>
              <Label className="text-slate-400">Select Amount</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {giftCardAmounts.map(amt => (
                  <Button
                    key={amt}
                    variant="outline"
                    className={cn(
                      "border-slate-700",
                      amount === String(amt) && !customAmount
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "text-slate-400 hover:bg-slate-800"
                    )}
                    onClick={() => { setAmount(String(amt)); setCustomAmount(''); }}
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
              <div className="mt-2">
                <Label className="text-slate-500 text-sm">Custom Amount</Label>
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
                  placeholder="$0.00"
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            {/* Recipient Info (Optional) */}
            <div>
              <Label className="text-slate-400">Recipient (Optional)</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Name"
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Email"
                className="bg-slate-800 border-slate-700 text-white mt-2"
              />
            </div>

            {selectedAmount && (
              <div className="bg-emerald-600/20 rounded-xl p-4 text-center">
                <span className="text-emerald-400 text-sm">Gift Card Value</span>
                <p className="text-3xl font-bold text-white">${parseFloat(selectedAmount).toFixed(2)}</p>
              </div>
            )}

            <Button 
              onClick={handlePurchase}
              disabled={!selectedAmount}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Purchase Gift Card
            </Button>
          </TabsContent>

          <TabsContent value="redeem" className="space-y-4 mt-4">
            {/* Code Entry */}
            <div>
              <Label className="text-slate-400">Gift Card Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX-XXXX"
                  className="bg-slate-800 border-slate-700 text-white uppercase tracking-wider"
                />
                <Button 
                  onClick={handleCheckBalance}
                  disabled={!redeemCode || checking}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {checking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-600/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span className="text-rose-400">{error}</span>
              </div>
            )}

            {/* Balance Display */}
            {balance !== null && (
              <div className="bg-emerald-600/20 rounded-xl p-4 text-center">
                <span className="text-emerald-400 text-sm">Available Balance</span>
                <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
              </div>
            )}

            <Button 
              onClick={handleRedeem}
              disabled={!redeemCode || balance === null || balance <= 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply to Order
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
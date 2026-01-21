import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock, DollarSign, Banknote, TrendingUp,
  AlertTriangle, CheckCircle, LogOut, Eye, EyeOff
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { useLanguage } from './LanguageContext';

export default function ShiftPanel({ shift, onStartShift, onEndShift, onCashDrop }) {
  const { t } = useLanguage();
  const [startDialog, setStartDialog] = useState(false);
  const [endDialog, setEndDialog] = useState(false);
  const [dropDialog, setDropDialog] = useState(false);
  const [startingCash, setStartingCash] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [dropAmount, setDropAmount] = useState('');
  const [showCash, setShowCash] = useState(false);

  const handleStartShift = () => {
    onStartShift(parseFloat(startingCash) || 0);
    setStartDialog(false);
    setStartingCash('');
  };

  const handleEndShift = () => {
    onEndShift(parseFloat(actualCash) || 0);
    setEndDialog(false);
    setActualCash('');
  };

  const handleCashDrop = () => {
    onCashDrop(parseFloat(dropAmount) || 0);
    setDropDialog(false);
    setDropAmount('');
  };

  if (!shift) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t('noActiveShift')}</h3>
          <p className="text-sm text-slate-500 mb-4">{t('startShiftDesc')}</p>
          <Button onClick={() => setStartDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Clock className="w-4 h-4 mr-2" />
            {t('startShift')}
          </Button>
        </CardContent>

        <Dialog open={startDialog} onOpenChange={setStartDialog}>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">{t('startNewShift')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-400">{t('startingCash')}</Label>
                <Input
                  type="number"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">{t('startingCashDesc')}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleStartShift} className="bg-emerald-600 hover:bg-emerald-700">
                {t('startShift')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  const variance = (shift.actual_cash || 0) - (shift.expected_cash || 0);

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t('activeShift')}</span>
          </CardTitle>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              {t('started')}
            </span>
            <span className="text-sm font-bold text-white">
              {format(new Date(shift.started_at || new Date()), 'h:mm a')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all hover:bg-slate-800/60">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t('sales')}</span>
            </div>
            <p className="text-3xl font-black text-white">${(shift.total_sales || 0).toFixed(2)}</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 transition-all hover:bg-slate-800/60">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t('tips')}</span>
            </div>
            <p className="text-3xl font-black text-emerald-400">${(shift.total_tips || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Banknote className="w-20 h-20 text-white" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2 text-slate-300">
              <Banknote className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold uppercase tracking-wide">{t('cashInDrawer')}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
              onClick={() => setShowCash(!showCash)}
            >
              {showCash ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-4xl font-black text-white relative z-10 font-mono tracking-tighter">
            {showCash ? `$${(shift.expected_cash || 0).toFixed(2)}` : '••••••'}
          </p>
        </div>

        <div className="pt-2 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-14 rounded-xl border-slate-700 bg-slate-800/30 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-base font-bold"
            onClick={() => setDropDialog(true)}
          >
            <Banknote className="w-5 h-5 mr-2" />
            {t('cashDrop')}
          </Button>
          <Button
            className="flex-1 h-14 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20 transition-all text-base font-bold"
            onClick={() => setEndDialog(true)}
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t('endShift')}
          </Button>
        </div>
      </CardContent>

      {/* Cash Drop Dialog */}
      <Dialog open={dropDialog} onOpenChange={setDropDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">{t('blindCashDrop')}</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-slate-400">{t('dropAmount')}</Label>
            <Input
              type="number"
              value={dropAmount}
              onChange={(e) => setDropAmount(e.target.value)}
              placeholder="0.00"
              className="bg-slate-800 border-slate-700 text-white mt-1"
            />
            <p className="text-xs text-slate-500 mt-2">
              {t('dropAmountDesc')}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleCashDrop} className="bg-blue-600 hover:bg-blue-700">
              {t('confirmDrop')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={endDialog} onOpenChange={setEndDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">{t('endShiftCashCount')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">{t('actualCashInDrawer')}</Label>
              <Input
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder={t('countYourDrawer')}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>
            {actualCash && (
              <div className={cn(
                "rounded-xl p-4 text-center",
                Math.abs(parseFloat(actualCash) - (shift.expected_cash || 0)) < 1
                  ? "bg-emerald-600/20"
                  : "bg-rose-600/20"
              )}>
                {Math.abs(parseFloat(actualCash) - (shift.expected_cash || 0)) < 1 ? (
                  <>
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                    <p className="text-emerald-400 font-medium">{t('drawerBalanced')}</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
                    <p className="text-rose-400 font-medium">
                      {t('variance')}: ${(parseFloat(actualCash) - (shift.expected_cash || 0)).toFixed(2)}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEndShift} className="bg-rose-600 hover:bg-rose-700">
              {t('closeShift')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
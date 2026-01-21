import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trash2, Plus, Minus, Send, Receipt, Split,
  UserCircle, MessageSquare, MoreVertical, X, DollarSign, CheckCircle, UtensilsCrossed
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';

export default function OrderPanel({
  order,
  onUpdateQuantity,
  onRemoveItem,
  onSendOrder,
  onPayment,
  onAddModifier,
  onServeItem,
  onCompleteOrder,
  onAdjustTip,
  table
}) {
  const { language, t } = useLanguage();
  const [modifierDialog, setModifierDialog] = useState({ open: false, itemIndex: null });
  const [noteText, setNoteText] = useState('');
  const [activeSeat, setActiveSeat] = useState(1);

  const items = order?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity * (item.is_comped ? 0 : 1)), 0);
  const discount = order?.discount || 0;
  const tax = (subtotal - discount) * 0.13;
  const total = subtotal - discount + tax;

  const seatItems = items.filter(item => !item.seat_number || item.seat_number === activeSeat);
  const seats = table?.guests || 1;

  if (!table) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 gap-4">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
          <UtensilsCrossed className="w-10 h-10 text-slate-600" />
        </div>
        <div className="text-center">
          <p className="font-medium text-lg">{t('selectTable')}</p>
          <p className="text-sm text-slate-600">{t('clickTableToStart') || 'Click a table to start an order'}</p>
        </div>
      </div>
    );
  }

  const handleAddNote = (index) => {
    if (noteText.trim()) {
      onAddModifier(index, noteText.trim());
      setNoteText('');
      setModifierDialog({ open: false, itemIndex: null });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-white">{table?.name || t('newOrder')}</h3>
            <p className="text-[10px] text-slate-500">
              {order?.server || t('noServer')} • {items.length} {t('items')}
            </p>
          </div>
          <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px] py-0 h-5">
            {order?.status || t('open')}
          </Badge>
        </div>

        {seats > 1 && (
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {Array.from({ length: seats }, (_, i) => i + 1).map(seat => (
              <button
                key={seat}
                onClick={() => setActiveSeat(seat)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap",
                  activeSeat === seat
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                )}
              >
                <UserCircle className="w-3 h-3 inline mr-1" />
                {t('seat')} {seat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 px-4 py-2 overflow-y-scroll">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Receipt className="w-16 h-16 mx-auto text-slate-800 mb-4" />
            <p className="text-slate-400 font-medium">{t('noItemsYet')}</p>
            <p className="text-xs text-slate-600 mt-1">{t('selectFromMenu')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-base font-semibold truncate",
                        item.is_comped ? "text-slate-500 line-through" : "text-white"
                      )}>
                        {language === 'zh' ? (item.name_zh || item.name) : item.name}
                      </span>
                      {item.is_comped && (
                        <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30">
                          COMP
                        </Badge>
                      )}
                    </div>
                    {item.modifiers?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.modifiers.map((mod, i) => (
                          <p key={i} className="text-xs text-amber-400/80 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-400/50" />
                            {mod}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-lg text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-700/50">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                        <DropdownMenuItem
                          onClick={() => setModifierDialog({ open: true, itemIndex: index })}
                          className="text-slate-300 focus:bg-slate-800 focus:text-white"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {t('addNote')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRemoveItem(index)}
                          className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('remove')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/30">
                  <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 border border-slate-700/20">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      disabled={item.status !== 'pending' && item.status !== undefined}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-white font-bold text-lg">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      disabled={item.status !== 'pending' && item.status !== undefined}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Serve Button */}
                  {(['beverages', 'alcohol', 'beers', 'wines'].includes(item.category) || item.status === 'ready') && (
                    item.status === 'sent' || item.status === 'ready' ? (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs ml-2"
                        onClick={() => onServeItem(index)}
                      >
                        Serve
                      </Button>
                    ) : item.status === 'served' ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-2">
                        Served
                      </Badge>
                    ) : null
                  )}

                  {item.seat_number && (
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                      {t('seat')} {item.seat_number}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-sm font-medium">{t('subtotal')}</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-emerald-400">
              <span className="text-sm font-medium">Discount</span>
              <span className="font-semibold">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-sm font-medium">{t('tax')} (13%)</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
            <span className="text-xl font-black text-white">{t('total')}</span>
            <span className="text-2xl font-black text-emerald-400">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {(order?.status === 'paid' || order?.payment_status === 'paid') ? (
            <Button
              onClick={onAdjustTip}
              className="h-16 font-bold text-xl rounded-xl shadow-lg bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <DollarSign className="w-6 h-6 mr-2" />
              Adjust Tip
            </Button>
          ) : (
            <Button
              onClick={onSendOrder}
              disabled={items.length === 0}
              className="h-16 font-bold text-xl rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Send className="w-6 h-6 mr-2" />
              {t('send')}
            </Button>
          )}
          {(order?.status === 'paid' || order?.payment_status === 'paid') ? (
            <Button
              onClick={onCompleteOrder}
              className="h-16 font-bold text-xl rounded-xl shadow-lg bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Close Table
            </Button>
          ) : (
            <Button
              onClick={onPayment}
              disabled={items.length === 0 || order?.status === 'paid' || order?.payment_status === 'paid'}
              className={cn(
                "h-16 font-bold text-xl rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                (order?.status === 'paid' || order?.payment_status === 'paid')
                  ? "bg-slate-700 text-slate-400 shadow-none border border-slate-600 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20"
              )}
            >
              <Receipt className="w-6 h-6 mr-2" />
              {(order?.status === 'paid' || order?.payment_status === 'paid') ? t('paid') : t('pay')}
            </Button>
          )}
        </div>
      </div>

      {/* Modifier Dialog */}
      <Dialog open={modifierDialog.open} onOpenChange={(open) => setModifierDialog({ open, itemIndex: null })}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">{t('addNoteModifier')}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t('notePlaceholder')}
            className="bg-slate-800 border-slate-700 text-white"
          />
          <div className="flex flex-wrap gap-2">
            {[t('noOnions'), t('extraSauce'), t('wellDone'), t('mediumRare'), t('glutenFree'), t('spicy')].map(mod => (
              <Button
                key={mod}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setNoteText(prev => prev ? `${prev}, ${mod}` : mod)}
              >
                {mod}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={() => handleAddNote(modifierDialog.itemIndex)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('addNote')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
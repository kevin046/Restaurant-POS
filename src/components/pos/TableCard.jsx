import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Users, Clock, Receipt, Bell, X, CreditCard, Banknote, Gift } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { useLanguage } from './LanguageContext';

export default function TableCard({ table, onClick, isSelected, onClear }) {
  const { language, t } = useLanguage();
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (!table.seated_at || table.status === 'available') {
      setDuration('');
      return;
    }

    const updateTimer = () => {
      const seatedDate = new Date(table.seated_at);
      const now = new Date();
      const diff = differenceInMinutes(now, seatedDate);

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      if (hours > 0) {
        setDuration(`${hours}h ${minutes}m`);
      } else {
        setDuration(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [table.seated_at, table.status]);

  const statusConfig = {
    available: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', label: t('available') },
    seated: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', label: t('seated') },
    ordered: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', label: t('ordered') },
    bill_requested: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', label: t('billRequested') },
    paid: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-500', label: t('paid') || 'Paid' },
    reserved: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', label: t('reserved') }
  };

  const config = statusConfig[table.status] || statusConfig.available;
  const isRound = table.shape === 'round';
  const tableName = language === 'zh' ? (table.name_zh || table.name) : table.name;

  return (
    <button
      onClick={() => onClick(table)}
      className={cn(
        "relative p-4 transition-all duration-300 hover:scale-105 active:scale-95",
        "border-2 backdrop-blur-sm",
        isRound ? "rounded-full aspect-square" : "rounded-xl",
        config.bg, config.border,
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-slate-900",
        "min-w-[100px] min-h-[100px]"
      )}
    >
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <span className="text-xl font-bold text-white">{tableName}</span>
        <span className={cn("text-xs font-medium", config.text)}>{config.label}</span>

        {table.guests > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-400">{table.guests}/{table.capacity}</span>
          </div>
        )}

        {table.seated_at && table.status !== 'available' && duration && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">
              {duration}
            </span>
          </div>
        )}
        {table.status === 'paid' && table.last_payment_method && (
          <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-slate-900/40 border border-white/10 shadow-sm backdrop-blur-md">
            {table.last_payment_method === 'cash' ? (
              <Banknote className="w-3 h-3 text-red-300" />
            ) : table.last_payment_method === 'gift' ? (
              <Gift className="w-3 h-3 text-red-300" />
            ) : (
              <CreditCard className="w-3 h-3 text-red-300" />
            )}
            <span className="text-[10px] font-bold text-red-100 uppercase tracking-wider">
              {table.last_payment_method === 'credit' || table.last_payment_method === 'debit' ? 'CARD' : table.last_payment_method}
            </span>
          </div>
        )}
      </div>

      {table.status === 'bill_requested' && (
        <div className="absolute -top-1 -right-1 animate-pulse">
          <Bell className="w-5 h-5 text-rose-400" />
        </div>
      )}

      {table.status === 'paid' && onClear && (
        <div
          onClick={(e) => onClear(table, e)}
          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md z-10 transition-colors cursor-pointer group"
          title="Clear/Close Table"
        >
          <X className="w-3 h-3 group-hover:scale-110 transition-transform" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
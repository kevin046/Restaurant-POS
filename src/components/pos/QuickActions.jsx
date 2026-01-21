import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Users, ArrowRightLeft, Printer, Clock, 
  AlertCircle, Coffee, Percent, Gift, XCircle 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from './LanguageContext';

export default function QuickActions({ onAction, disabled }) {
  const { t } = useLanguage();
  
  const actions = [
    { id: 'seat', icon: Users, label: t('seat') },
    { id: 'transfer', icon: ArrowRightLeft, label: t('transfer') },
    { id: 'rush', icon: AlertCircle, label: t('rush') },
    { id: 'comp', icon: Coffee, label: t('comp') },
    { id: 'print', icon: Printer, label: t('print') },
    { id: 'discount', icon: Percent, label: t('discount') },
    { id: 'hold', icon: Clock, label: t('hold') },
    { id: 'gift', icon: Gift, label: t('giftCard') },
    { id: 'clear', icon: XCircle, label: t('forceEmpty') || 'Force Empty' },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {actions.map(action => (
        <Button
          key={action.id}
          variant="outline"
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-auto py-2 px-1 border-slate-700 bg-slate-800/30",
            "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:border-slate-600 transition-all shadow-sm",
            disabled && "opacity-50 pointer-events-none"
          )}
          onClick={() => onAction(action.id)}
        >
          <action.icon className="w-4 h-4" />
          <span className="text-[10px] font-medium tracking-wide">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
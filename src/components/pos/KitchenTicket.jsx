import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Flame, ChefHat, Bell, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const stationColors = {
  grill: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  saute: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  cold: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  bar: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dessert: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
};

const statusColors = {
  sent: 'border-yellow-500/50 bg-yellow-500/10',
  preparing: 'border-blue-500/50 bg-blue-500/10',
  ready: 'border-emerald-500/50 bg-emerald-500/10'
};

export default function KitchenTicket({ order, language = 'en', onUpdateItemStatus, onBump, onAccept, onMarkAllReady }) {
  const nonKitchenCategories = ['beverages', 'alcohol', 'beers', 'wines', 'drinks', 'cocktails', 'coffee'];
  const kitchenItems = order.items
    ?.map((item, index) => ({ ...item, originalIndex: index }))
    .filter(item => !nonKitchenCategories.includes(item.category?.toLowerCase()) && item.status !== 'served') || [];

  const t = {
    en: {
      rush: "RUSH",
      new: "NEW",
      accept: "Accept",
      bump: "Bump",
      allReady: "All Ready",
      grill: "Grill",
      saute: "Sauté",
      cold: "Cold",
      bar: "Bar",
      dessert: "Dessert"
    },
    zh: {
      rush: "加急",
      new: "新",
      accept: "接单",
      bump: "完成",
      allReady: "全部就绪",
      grill: "烧烤",
      saute: "炒菜",
      cold: "凉菜",
      bar: "吧台",
      dessert: "甜点"
    }
  }[language];

  if (kitchenItems.length === 0) return null;

  const orderTime = order.created_date ? new Date(order.created_date) : new Date();
  const timeElapsed = formatDistanceToNow(orderTime, {
    addSuffix: false,
    locale: language === 'zh' ? zhCN : undefined
  });

  const allReady = kitchenItems.every(item => ['ready', 'served'].includes(item.status));
  const isNewOrder = order.status === 'sent';
  const priorityOrder = kitchenItems.some(item => item.status === 'sent');
  const isRush = order.is_rush;

  return (
    <div
      className={cn(
        "rounded-xl border-2 overflow-hidden transition-all",
        isNewOrder ? "border-amber-500 bg-amber-500/5 animate-pulse" : statusColors[allReady ? 'ready' : priorityOrder ? 'sent' : 'preparing']
      )}
    >
      {/* Header */}
      <div className={cn(
        "p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2",
        isNewOrder ? "bg-amber-900/50" : isRush ? "bg-rose-900/50" : "bg-slate-800/80"
      )}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-white">
              {order.type === 'takeout' ? (
                <span className="flex items-center gap-2">
                  🛍️ {order.table_name || 'Takeout'}
                </span>
              ) : (
                order.table_name
              )}
            </span>
            {isRush && (
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse text-[10px] px-1.5">
                <AlertTriangle className="w-3 h-3 mr-0.5" />
                {t.rush}
              </Badge>
            )}
            {order.type === 'takeout' && (
              <Badge className={cn(
                "text-[10px] px-1.5",
                order.payment_status === 'paid'
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "bg-orange-500/20 text-orange-400 border-orange-500/30"
              )}>
                {order.payment_status === 'paid' ? 'PAID ONLINE' : 'PAY IN STORE'}
              </Badge>
            )}
            <Badge variant="outline" className={cn(
              "text-[10px] px-1.5",
              isNewOrder ? "border-amber-500 text-amber-400" : "border-slate-600 text-slate-400"
            )}>
              {isNewOrder ? t.new : `#${order.id?.slice(-4)}`}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="text-[10px] sm:text-xs text-slate-500 truncate">{timeElapsed} • {order.server || 'Online'}</span>
          </div>
        </div>

        {isNewOrder ? (
          <Button
            onClick={() => onAccept(order.id)}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 animate-bounce w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
          >
            <ChefHat className="w-4 h-4 mr-1.5" />
            {t.accept}
          </Button>
        ) : allReady ? (
          <Button
            onClick={() => onBump(order.id)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
          >
            <Bell className="w-4 h-4 mr-1.5" />
            {t.bump}
          </Button>
        ) : (
          <Button
            onClick={() => onMarkAllReady(order.id)}
            variant="outline"
            size="sm"
            className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            {t.allReady}
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="p-3 space-y-2">
        {kitchenItems.map((item, index) => {
          const isDone = ['ready', 'served'].includes(item.status);
          return (
            <div
              key={index}
              className={cn(
                "flex items-start justify-between p-2 rounded-lg transition-all",
                !isNewOrder && "cursor-pointer hover:bg-slate-800/50",
                isDone && "opacity-50"
              )}
              onClick={() => !isNewOrder && !isDone && onUpdateItemStatus(order.id, item.originalIndex)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold",
                    isDone ? "text-slate-500 line-through" : "text-white"
                  )}>
                    {item.quantity}x {language === 'zh' ? (item.name_zh || item.name) : item.name}
                  </span>
                  {item.station && (
                    <Badge className={cn("text-[10px]", stationColors[item.station])}>
                      {t[item.station] || item.station}
                    </Badge>
                  )}
                </div>
                {item.modifiers?.length > 0 && (
                  <div className="mt-1">
                    {item.modifiers.map((mod, i) => (
                      <p key={i} className="text-xs text-amber-400 font-medium">⚡ {mod}</p>
                    ))}
                  </div>
                )}
                {item.notes && (
                  <p className="text-xs text-rose-400 mt-1">📝 {item.notes}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : item.status === 'preparing' ? (
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
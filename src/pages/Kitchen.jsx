import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import KitchenTicket from '@/components/pos/KitchenTicket';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChefHat, Flame, Snowflake, Wine,
  Bell, Volume2, VolumeX, RefreshCw, Languages, Globe
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Kitchen() {
  const queryClient = useQueryClient();
  const [activeStation, setActiveStation] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('en');

  const t = {
    en: {
      title: "Kitchen Display",
      subtitle: "Real-time order management",
      new: "New",
      cooking: "Cooking",
      ready: "Ready",
      all: "All",
      grill: "Grill",
      saute: "Sauté",
      cold: "Cold",
      bar: "Bar",
      noOrders: "No Active Orders",
      noOrdersDesc: "Orders will appear here when sent from POS",
      toasts: {
        newOrder: "New order received!",
        orderUpdated: "Order updated!",
        orderAccepted: "Order accepted - now cooking!",
        allReady: "All items marked ready!",
        orderBumped: "Order bumped!"
      }
    },
    zh: {
      title: "厨房显示",
      subtitle: "实时订单管理",
      new: "新订单",
      cooking: "烹饪中",
      ready: "已准备",
      all: "全部",
      grill: "烧烤",
      saute: "炒菜",
      cold: "凉菜",
      bar: "吧台",
      noOrders: "暂无活动订单",
      noOrdersDesc: "POS发送的订单将显示在这里",
      toasts: {
        newOrder: "收到新订单！",
        orderUpdated: "订单已更新！",
        orderAccepted: "订单已接收 - 开始烹饪！",
        allReady: "所有项目已就绪！",
        orderBumped: "订单已完成！"
      }
    }
  }[language];

  const stations = [
    { id: 'all', label: t.all, icon: ChefHat },
    { id: 'grill', label: t.grill, icon: Flame },
    { id: 'saute', label: t.saute, icon: Flame },
    { id: 'cold', label: t.cold, icon: Snowflake },
    { id: 'bar', label: t.bar, icon: Wine },
  ];


  const { data: allOrders = [], isLoading, refetch } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      // Fetch all orders and filter client-side to avoid API filtering issues
      const orders = await base44.entities.Order.list();
      // Only show orders that are in active kitchen statuses
      const activeStatuses = ['sent', 'preparing', 'ready'];
      return orders.filter(o => activeStatuses.includes(o.status));
    },
    refetchInterval: 5000 // Auto refresh every 5 seconds
  });

  // Ensure orders is always an array
  const orders = Array.isArray(allOrders) ? allOrders : [];

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-sim'],
    queryFn: () => base44.entities.MenuItem.list()
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['kitchen-orders'])
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      // Active kitchen statuses
      const activeStatuses = ['sent', 'preparing', 'ready'];

      // Check if this is a relevant order for the kitchen
      const isRelevantOrder = event.data?.status && activeStatuses.includes(event.data.status);
      const isNewOrder = event.type === 'create' && isRelevantOrder;
      const isUpdatedOrder = event.type === 'update' && isRelevantOrder;

      if (isNewOrder || isUpdatedOrder) {
        // Immediately refetch to ensure display is updated
        queryClient.invalidateQueries(['kitchen-orders']);
        refetch();

        if (isNewOrder) {
          toast.info(t.toasts.newOrder, {
            duration: 3000,
            position: 'top-center'
          });
        } else if (event.type === 'update' && event.data?.status === 'sent') {
          toast.info(t.toasts.orderUpdated, {
            duration: 3000,
            position: 'top-center'
          });
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient, refetch, t.toasts]);

  // Persistent notification loop for pending orders
  useEffect(() => {
    const hasPendingOrders = orders.some(o => o.status === 'sent');
    let intervalId;

    if (hasPendingOrders && soundEnabled) {
      const playSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.7;
        audio.play().catch(e => console.log('Audio play failed:', e));
      };

      // Play immediately
      playSound();

      // Loop every 5 seconds
      intervalId = setInterval(playSound, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orders, soundEnabled]);


  const handleUpdateItemStatus = async (orderId, itemIndex) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedItems = [...order.items];
    const currentStatus = updatedItems[itemIndex].status;

    // Cycle through statuses: sent -> preparing -> ready
    const nextStatus = {
      'sent': 'preparing',
      'preparing': 'ready',
      'ready': 'sent'
    }[currentStatus] || 'preparing';

    updatedItems[itemIndex].status = nextStatus;

    // Check if all items are ready
    const allReady = updatedItems.every(item => item.status === 'ready');

    await updateOrder.mutateAsync({
      id: orderId,
      data: {
        items: updatedItems,
        status: allReady ? 'ready' : 'preparing'
      }
    });
  };

  const handleAcceptOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Only update items that are currently 'sent' (pending) to 'preparing'
    // Preserve status of items that are already 'ready' or 'served'
    const updatedItems = order.items.map(item =>
      item.status === 'sent' ? { ...item, status: 'preparing' } : item
    );

    await updateOrder.mutateAsync({
      id: orderId,
      data: {
        status: 'preparing',
        items: updatedItems
      }
    });

    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVdEkeLT4n9THzpwl83hq4JqVZO73dSKe4aFgH13cnN+lpyXi3VgWm6MpqiXeVxQYYOeo5yJdGtqdoiUl5KJfXdzcHmAhYB7d3V2fIKFg397dnR2en2Ag4OBgH59fYCDg4F/fX19f4GCgYB/fn5/gIGBgYB/f39/gIGBgYB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gA==');
      audio.play().catch(() => { });
    }
    toast.success(t.toasts.orderAccepted);
  };

  const handleMarkAllReady = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    await updateOrder.mutateAsync({
      id: orderId,
      data: {
        status: 'ready',
        items: order.items.map(item => ({ ...item, status: 'ready' }))
      }
    });

    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVdEkeLT4n9THzpwl83hq4JqVZO73dSKe4aFgH13cnN+lpyXi3VgWm6MpqiXeVxQYYOeo5yJdGtqdoiUl5KJfXdzcHmAhYB7d3V2fIKFg397dnR2en2Ag4OBgH59fYCDg4F/fX19f4GCgYB/fn5/gIGBgYB/f39/gIGBgYB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gA==');
      audio.play().catch(() => { });
    }
    toast.success(t.toasts.allReady);
  };

  const handleBumpOrder = async (orderId) => {
    await updateOrder.mutateAsync({
      id: orderId,
      data: {
        status: 'served',
        items: orders.find(o => o.id === orderId)?.items.map(item => ({ ...item, status: 'served' }))
      }
    });

    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVdEkeLT4n9THzpwl83hq4JqVZO73dSKe4aFgH13cnN+lpyXi3VgWm6MpqiXeVxQYYOeo5yJdGtqdoiUl5KJfXdzcHmAhYB7d3V2fIKFg397dnR2en2Ag4OBgH59fYCDg4F/fX19f4GCgYB/fn5/gIGBgYB/f39/gIGBgYB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgIB/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAgH9/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gICAf39/f39/gA==');
      audio.play().catch(() => { });
    }
    toast.success(t.toasts.orderBumped);
  };

  const filteredOrders = orders.filter(order => {
    if (activeStation === 'all') return true;
    return order.items?.some(item => item.station === activeStation);
  });

  const pendingCount = orders.filter(o => o.status === 'sent').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  const handleSimulateOnlineOrder = async () => {
    if (!menuItems || menuItems.length === 0) {
      toast.error('No menu items available for simulation');
      return;
    }

    const isPaid = Math.random() > 0.5;

    // Generate random number of items (1-4)
    const numItems = Math.floor(Math.random() * 4) + 1;
    const orderItems = [];

    // Randomly select items from menu
    for (let i = 0; i < numItems; i++) {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const randomQuantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity

      orderItems.push({
        item_id: randomItem.id,
        name: randomItem.name,
        name_zh: randomItem.name_zh || randomItem.name,
        quantity: randomQuantity,
        price: randomItem.price,
        station: randomItem.station || 'grill',
        status: 'sent',
        category: randomItem.category || 'mains'
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    const newOrder = {
      table_name: `WEB #${Math.floor(Math.random() * 9000) + 1000}`,
      type: 'takeout',
      status: 'sent',
      guests: 1,
      server: 'Online Website',
      payment_status: isPaid ? 'paid' : 'unpaid',
      payment_method: isPaid ? (Math.random() > 0.5 ? 'credit' : 'debit') : null,
      is_online: true,
      items: orderItems,
      subtotal,
      tax,
      total,
      opened_at: new Date().toISOString(),
      closed_at: isPaid ? new Date().toISOString() : null, // Set closed_at if paid online
      created_date: new Date().toISOString()
    };

    try {
      // 1. Create the Order
      const createdOrder = await base44.entities.Order.create(newOrder);

      // 2. If it's paid, create the Transaction
      if (isPaid && createdOrder?.id) {
        await base44.entities.Transaction.create({
          order_id: createdOrder.id,
          type: 'payment',
          method: newOrder.payment_method,
          amount: newOrder.total,
          tip: 0, // Online orders usually have tips separate or 0 for sim
          server: 'Online System',
          status: 'approved',
          created_date: new Date().toISOString()
        });
      }

      toast.success(`Simulated Web Order (${isPaid ? 'Paid Online' : 'Pay In Store'}) - $${total.toFixed(2)}`);
    } catch (error) {
      console.error("Error creating simulation:", error);
      toast.error("Failed to simulate order");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.title}</h1>
              <p className="text-sm text-slate-500">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-3 mr-4">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {pendingCount} {t.new}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {preparingCount} {t.cooking}
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {readyCount} {t.ready}
              </Badge>
            </div>

            {/* Controls */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "border-slate-700 gap-2 min-w-[80px]",
                language === 'zh' ? "text-amber-400 border-amber-500/30 bg-amber-500/10" : "text-slate-400"
              )}
              onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')}
            >
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'EN' : '中文'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "border-slate-700",
                soundEnabled ? "text-emerald-400" : "text-slate-500"
              )}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-slate-700 text-slate-400"
              onClick={() => refetch()}
            >
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-400 gap-2"
              onClick={handleSimulateOnlineOrder}
            >
              <Globe className="w-4 h-4" />
              Simulate Web Order
            </Button>
          </div>
        </div>

        {/* Station Filters */}
        <div className="flex gap-2 mt-4">
          {stations.map(station => (
            <Button
              key={station.id}
              variant={activeStation === station.id ? "default" : "outline"}
              className={cn(
                "gap-2",
                activeStation === station.id
                  ? "bg-white text-slate-900"
                  : "border-slate-700 text-slate-400 hover:bg-slate-800"
              )}
              onClick={() => setActiveStation(station.id)}
            >
              <station.icon className="w-4 h-4" />
              {station.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Orders Grid */}
      <main className="p-6">
        {isLoading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-16 h-16 mx-auto text-slate-700 mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-slate-500 mb-2">Loading Orders...</h3>
            <p className="text-slate-600">Please wait</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="w-16 h-16 mx-auto text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-500 mb-2">
              {orders.length > 0 && activeStation !== 'all'
                ? `No orders for ${stations.find(s => s.id === activeStation)?.label || 'this station'}`
                : t.noOrders
              }
            </h3>
            <p className="text-slate-600">
              {orders.length > 0 && activeStation !== 'all'
                ? 'Try selecting a different station or "All" to see all orders'
                : t.noOrdersDesc
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map(order => (
              <KitchenTicket
                key={order.id}
                order={order}
                language={language}
                onUpdateItemStatus={handleUpdateItemStatus}
                onBump={handleBumpOrder}
                onAccept={handleAcceptOrder}
                onMarkAllReady={handleMarkAllReady}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
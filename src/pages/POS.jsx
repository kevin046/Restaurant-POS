import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloorPlan from '@/components/pos/FloorPlan';
import MenuGrid from '@/components/pos/MenuGrid';
import OrderPanel from '@/components/pos/OrderPanel';
import PaymentModal from '@/components/pos/PaymentModal';
import QuickActions from '@/components/pos/QuickActions';
import ShiftPanel from '@/components/pos/ShiftPanel';
import TransferTableModal from '@/components/pos/TransferTableModal';
import DiscountModal from '@/components/pos/DiscountModal';
import CompItemModal from '@/components/pos/CompItemModal';
import GiftCardModal from '@/components/pos/GiftCardModal';
import HoldOrderModal from '@/components/pos/HoldOrderModal';
import PrintReceiptModal from '@/components/pos/PrintReceiptModal';
import KitchenTicket from '@/components/pos/KitchenTicket';
import ShiftReportModal from '@/components/pos/ShiftReportModal';
import { LanguageProvider, useLanguage } from '@/components/pos/LanguageContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  LayoutGrid, UtensilsCrossed, Clock, Settings,
  Users, ChefHat, BarChart3, LogOut, Menu, Languages,
  DollarSign
} from 'lucide-react';
import { cn } from "@/lib/utils";

function POSContent() {
  const { t, language, toggleLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showTipAdjustment, setShowTipAdjustment] = useState(false);
  const [tipAdjustmentAmount, setTipAdjustmentAmount] = useState('');
  const [seatDialog, setSeatDialog] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [activeTab, setActiveTab] = useState('floor');
  const [user, setUser] = useState(null);

  // Modal states
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showComp, setShowComp] = useState(false);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [showHold, setShowHold] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showShiftReport, setShowShiftReport] = useState(false);
  const [lastClosedShift, setLastClosedShift] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => { });
  }, []);

  // Queries
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: () => base44.entities.Table.list()
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => base44.entities.MenuItem.list()
  });

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list()
  });

  const { data: shifts = [], refetch: refetchShifts } = useQuery({
    queryKey: ['shifts', user?.email],
    queryFn: () => base44.entities.Shift.filter({ server: user?.email, status: 'active' }),
    enabled: !!user?.email
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', currentOrder?.id],
    queryFn: () => base44.entities.Transaction.filter({ order_id: currentOrder?.id }),
    enabled: !!currentOrder?.id
  });

  // Refetch shifts when user loads
  useEffect(() => {
    if (user?.email) {
      refetchShifts();
    }
  }, [user?.email, refetchShifts]);

  // Sync selectedTable with latest data from tables
  useEffect(() => {
    if (selectedTable && !selectedTable.isVirtual) { // Only sync physical tables
      const updatedTable = tables.find(t => t.id === selectedTable.id);
      if (updatedTable && (
        updatedTable.status !== selectedTable.status ||
        updatedTable.guests !== selectedTable.guests ||
        updatedTable.seated_at !== selectedTable.seated_at
      )) {
        setSelectedTable(updatedTable);
      }
    }
  }, [tables, selectedTable]);

  const activeShift = shifts[0];

  // Mutations
  const updateTable = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Table.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['tables'])
  });

  const createOrder = useMutation({
    mutationFn: (data) => base44.entities.Order.create(data),
    onSuccess: () => queryClient.invalidateQueries(['orders'])
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['orders'])
  });

  const createShift = useMutation({
    mutationFn: (data) => base44.entities.Shift.create(data),
    onSuccess: () => queryClient.invalidateQueries(['shifts'])
  });

  const updateShift = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shift.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['shifts'])
  });

  const createTransaction = useMutation({
    mutationFn: (data) => base44.entities.Transaction.create(data),
    onSuccess: () => queryClient.invalidateQueries(['transactions'])
  });

  const updateTransaction = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['orders']); // Tips are in orders too
      refetchShifts(); // Update shift totals
    }
  });

  // Calculate Takeout "Virtual" Tables
  const takeoutOrders = orders.filter(o =>
    (o.type === 'takeout' || o.is_online) &&
    !['completed', 'cancelled'].includes(o.status)
  );

  const takeoutTables = takeoutOrders.map(order => ({
    id: order.id, // Virtual ID matches order ID
    name: order.table_name || `Takeout #${order.id.slice(-4)}`,
    section: 'TakeOut',
    // Check both payment_status and status for paid orders
    // This ensures in-store payment correctly marks the table as paid
    status: (order.payment_status === 'paid' || order.status === 'paid') ? 'paid' : 'ordered',
    guests: order.guests || 1,
    capacity: 1,
    seated_at: order.created_at || order.opened_at,
    isVirtual: true,
    orderId: order.id,
    last_payment_method: order.payment_method
  }));

  const allDisplayTables = [...tables, ...takeoutTables];

  // Handlers
  const handleTableSelect = (table) => {
    setSelectedTable(table);

    if (table.isVirtual) {
      // Direct Select for Virtual Tables (Takeout)
      const order = orders.find(o => o.id === table.orderId);
      if (order) {
        setCurrentOrder(order);
        setActiveTab('menu');
      }
      return;
    }

    // Check if table has an active order (not paid, cancelled)
    // 'served' status means food is delivered but not yet paid
    // 'paid' status means bill is paid but table is not yet cleared
    const activeStatuses = ['open', 'sent', 'preparing', 'ready', 'hold', 'served', 'paid'];
    const existingOrder = orders.find(o => o.table_id === table.id && activeStatuses.includes(o.status));
    if (existingOrder) {
      setCurrentOrder(existingOrder);
      setActiveTab('menu');
    } else if (table.status === 'available') {
      setCurrentOrder(null); // Clear previous order data
      setSeatDialog(true);
    } else {
      // Table is seated but no order found - create new order object
      setCurrentOrder({
        table_id: table.id,
        table_name: table.name,
        server: user?.email,
        items: [],
        status: 'open'
      });
      setActiveTab('menu');
    }
  };

  const handleSeatTable = async () => {
    try {
      await updateTable.mutateAsync({
        id: selectedTable.id,
        data: {
          status: 'seated',
          guests: guestCount,
          seated_at: new Date().toISOString(),
          current_server: user?.email
        }
      });

      const newOrder = {
        table_id: selectedTable.id,
        table_name: selectedTable.name,
        server: user?.email,
        guests: guestCount,
        items: [],
        status: 'open',
        opened_at: new Date().toISOString()
      };

      const created = await createOrder.mutateAsync(newOrder);
      setCurrentOrder({ ...newOrder, id: created.id });
      setSeatDialog(false);
      setActiveTab('menu');
      toast.success(`${selectedTable.name} ${t('tableSeated')} ${guestCount} ${t('guests')}`);
    } catch (error) {
      toast.error('Error seating table');
    }
  };

  const handleItemSelect = (item) => {
    if (!currentOrder) {
      toast.error(t('pleaseSelectTable'));
      return;
    }

    const existingIndex = currentOrder.items?.findIndex(
      i => i.item_id === item.id && (!i.modifiers || i.modifiers.length === 0) && i.status === 'pending'
    );

    let updatedItems;
    if (existingIndex >= 0) {
      updatedItems = [...currentOrder.items];
      updatedItems[existingIndex].quantity += 1;
    } else {
      const newItem = {
        item_id: item.id,
        name: item.name,
        name_zh: item.name_zh,
        category: item.category,
        price: item.price,
        quantity: 1,
        station: item.station,
        modifiers: [],
        status: 'pending'
      };
      updatedItems = [...(currentOrder.items || []), newItem];
    }

    setCurrentOrder({ ...currentOrder, items: updatedItems });
  };

  const handleUpdateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updatedItems = [...currentOrder.items];
    updatedItems[index].quantity = quantity;
    setCurrentOrder({ ...currentOrder, items: updatedItems });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = currentOrder.items.filter((_, i) => i !== index);
    setCurrentOrder({ ...currentOrder, items: updatedItems });
  };

  const handleServeItem = async (index) => {
    if (!currentOrder) return;
    const updatedItems = [...currentOrder.items];
    updatedItems[index].status = 'served';

    setCurrentOrder({ ...currentOrder, items: updatedItems });

    if (currentOrder.id) {
      await updateOrder.mutateAsync({
        id: currentOrder.id,
        data: { items: updatedItems }
      });
    }
    toast.success('Item served!');
  };

  const handleAddModifier = (index, modifier) => {
    const updatedItems = [...currentOrder.items];
    updatedItems[index].modifiers = [...(updatedItems[index].modifiers || []), modifier];
    setCurrentOrder({ ...currentOrder, items: updatedItems });
  };

  const handleSendOrder = async () => {
    // Check if there are any pending items to send
    const pendingItems = currentOrder?.items?.filter(item => item.status === 'pending');

    if (!pendingItems || pendingItems.length === 0) {
      toast.error('No new items to send to kitchen');
      return;
    }

    if (!selectedTable) {
      toast.error(t('pleaseSelectTable'));
      return;
    }

    try {
      const subtotal = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.13;
      const total = subtotal + tax;

      // Update item statuses: 'pending' -> 'sent'
      const updatedItems = currentOrder.items.map(item =>
        item.status === 'pending' ? { ...item, status: 'sent' } : item
      );

      const orderData = {
        table_id: selectedTable.isVirtual ? null : selectedTable.id, // Null for virtual tables
        table_name: selectedTable.name,
        server: user?.email,
        guests: currentOrder.guests || selectedTable.guests,
        items: updatedItems,
        status: 'sent',
        subtotal,
        tax,
        total,
        opened_at: currentOrder.opened_at || new Date().toISOString(),
        type: selectedTable.isVirtual ? 'takeout' : 'dine_in', // Set order type
        is_online: selectedTable.isVirtual && selectedTable.name.startsWith('Online') // Example for online orders
      };

      if (currentOrder.id) {
        // For existing orders, we update the entire order object
        await updateOrder.mutateAsync({ id: currentOrder.id, data: orderData });
        setCurrentOrder({ ...orderData, id: currentOrder.id });
      } else {
        const created = await createOrder.mutateAsync(orderData);
        setCurrentOrder({ ...orderData, id: created.id });
      }

      if (!selectedTable.isVirtual) {
        const latestTable = tables.find(t => t.id === selectedTable.id);
        const currentSeatedAt = latestTable?.seated_at || selectedTable?.seated_at;
        const currentGuests = currentOrder.guests || latestTable?.guests || selectedTable?.guests;

        await updateTable.mutateAsync({
          id: selectedTable.id,
          data: {
            status: 'ordered',
            guests: currentGuests,
            seated_at: currentSeatedAt
          }
        });

        setSelectedTable(prev => ({
          ...prev,
          status: 'ordered',
          guests: currentGuests,
          seated_at: currentSeatedAt
        }));
      }


      toast.success(t('orderSentToKitchen'));
    } catch (error) {
      toast.error('Error sending order');
      console.error(error);
    }
  };



  const handleUpdateTip = async () => {
    if (!currentOrder || !activeShift) return;

    // Find the payment transaction for this order
    const paymentTx = transactions.find(t => t.order_id === currentOrder.id && t.type === 'payment' && t.status === 'approved');

    if (!paymentTx) {
      toast.error('No payment record found for this order');
      return;
    }

    const newTip = parseFloat(tipAdjustmentAmount) || 0;
    const oldTip = paymentTx.tip || 0;
    const diff = newTip - oldTip;

    try {
      // 1. Update Transaction
      await updateTransaction.mutateAsync({
        id: paymentTx.id,
        data: { tip: newTip }
      });

      // 2. Update Order
      await updateOrder.mutateAsync({
        id: currentOrder.id,
        data: { tip: newTip }
      });

      // 3. Update Shift
      await updateShift.mutateAsync({
        id: activeShift.id,
        data: {
          total_tips: (activeShift.total_tips || 0) + diff
        }
      });

      // 4. Update Current Order Local State
      setCurrentOrder(prev => ({ ...prev, tip: newTip }));

      toast.success(`Tip updated to $${newTip.toFixed(2)}`);
      setShowTipAdjustment(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to update tip');
    }
  };

  const handlePayment = async (paymentData) => {
    if (!currentOrder?.id) return;

    try {
      // 1. Create Transaction
      await createTransaction.mutateAsync({
        order_id: currentOrder.id,
        type: 'payment',
        method: paymentData.method,
        amount: paymentData.amount,
        tip: paymentData.tip,
        server: user?.email,
        shift_id: activeShift?.id,
        status: 'approved'
      });

      // 2. Update Order Items (if split by item)
      let updatedItems = [...currentOrder.items];
      let orderFullyPaid = false;

      if (paymentData.isPartial && paymentData.split?.type === 'item') {
        const paidItems = paymentData.split.items || [];

        // Update paid_quantity
        paidItems.forEach(explodedItem => {
          const idx = explodedItem.originalIndex;
          if (updatedItems[idx]) {
            updatedItems[idx].paid_quantity = (updatedItems[idx].paid_quantity || 0) + 1;
          }
        });

        // Check if all items are fully paid
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPaid = updatedItems.reduce((sum, item) => sum + (item.paid_quantity || 0), 0);

        if (totalPaid >= totalItems) {
          orderFullyPaid = true;
        }
      } else if (!paymentData.isPartial) {
        // Full payment (or assumed full if not partial)
        orderFullyPaid = true;
      }

      // Check if order is fully paid by amount (for equal splits or partial payments)
      if (!orderFullyPaid) {
        const previousPaid = transactions
          .filter(t => t.status === 'approved')
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const totalPaid = previousPaid + paymentData.amount;
        const orderTotal = currentOrder.total || 0;

        // Use a small epsilon for float comparison
        if (orderTotal > 0 && totalPaid >= orderTotal - 0.01) {
          orderFullyPaid = true;
        }
      }

      // 3. Update Order and Table Status
      if (orderFullyPaid) {
        // For all orders (dine-in and takeout), mark as 'paid' when fully paid
        // This ensures takeout orders don't remain as 'served' after payment
        await updateOrder.mutateAsync({
          id: currentOrder.id,
          data: {
            status: 'paid',
            payment_method: paymentData.method,
            tip: paymentData.tip,
            items: updatedItems,
            closed_at: new Date().toISOString(),
            payment_status: 'paid' // Critical for takeout orders to show as paid
          }
        });

        if (!selectedTable.isVirtual) {
          await updateTable.mutateAsync({
            id: selectedTable.id,
            data: {
              status: 'paid',
              guests: selectedTable.guests, // Keep guests
              seated_at: selectedTable.seated_at, // Keep timer
              current_server: selectedTable.current_server, // Keep server
              last_payment_method: paymentData.method // Store payment method
            }
          });

          // Update local selectedTable state
          setSelectedTable(prev => ({
            ...prev,
            status: 'paid'
          }));
        } else {
          // For virtual tables, update its status locally to reflect payment
          setSelectedTable(prev => ({
            ...prev,
            status: 'paid'
          }));
        }


        // Update local currentOrder state to reflect paid status
        setCurrentOrder({
          ...currentOrder,
          status: 'paid',
          payment_status: 'paid',
          items: updatedItems
        });

        // Close payment modal and return to floor tab for quicker processing
        setShowPayment(false);
        setActiveTab('floor');
        toast.success(t('paymentComplete'));
      } else {
        // Partial Payment - Update items but keep order open
        await updateOrder.mutateAsync({
          id: currentOrder.id,
          data: {
            items: updatedItems
          }
        });

        // Update local state to trigger re-render in PaymentModal
        setCurrentOrder({ ...currentOrder, items: updatedItems });
        toast.success('Partial payment recorded');
      }

      // 4. Update Shift
      if (activeShift) {
        await updateShift.mutateAsync({
          id: activeShift.id,
          data: {
            total_sales: (activeShift.total_sales || 0) + paymentData.amount,
            total_tips: (activeShift.total_tips || 0) + paymentData.tip,
            orders_count: orderFullyPaid ? (activeShift.orders_count || 0) + 1 : activeShift.orders_count,
            expected_cash: paymentData.method === 'cash'
              ? (activeShift.expected_cash || 0) + paymentData.amount
              : activeShift.expected_cash
          }
        });
      }
    } catch (error) {
      toast.error('Error processing payment');
      console.error(error);
    }
  };

  const handleStartShift = async (startingCash) => {
    try {
      await createShift.mutateAsync({
        server: user?.email,
        server_name: user?.full_name,
        status: 'active',
        started_at: new Date().toISOString(),
        starting_cash: startingCash,
        expected_cash: startingCash,
        total_sales: 0,
        total_tips: 0,
        orders_count: 0,
        cash_drops: []
      });
      toast.success(t('shiftStarted'));
    } catch (error) {
      toast.error('Error starting shift');
    }
  };

  const handleEndShift = async (actualCash) => {
    if (!activeShift) return;

    try {
      const closedShiftData = {
        ...activeShift,
        status: 'closed',
        ended_at: new Date().toISOString(),
        actual_cash: actualCash,
        variance: actualCash - (activeShift.expected_cash || 0)
      };

      await updateShift.mutateAsync({
        id: activeShift.id,
        data: {
          status: 'closed',
          ended_at: closedShiftData.ended_at,
          actual_cash: actualCash,
          variance: closedShiftData.variance
        }
      });

      setLastClosedShift(closedShiftData);
      setShowShiftReport(true);
      toast.success(t('shiftEnded'));
    } catch (error) {
      toast.error('Error ending shift');
    }
  };

  const handleCashDrop = async (amount) => {
    if (!activeShift) return;

    try {
      const drops = [...(activeShift.cash_drops || []), {
        amount,
        time: new Date().toISOString()
      }];

      await updateShift.mutateAsync({
        id: activeShift.id,
        data: {
          cash_drops: drops,
          expected_cash: (activeShift.expected_cash || 0) - amount
        }
      });
      toast.success(`${t('cashDropRecorded')}: $${amount.toFixed(2)}`);
    } catch (error) {
      toast.error('Error recording cash drop');
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'seat':
        if (selectedTable?.status === 'available' && !selectedTable?.isVirtual) setSeatDialog(true);
        else toast.error('Please select an available physical table first');
        break;
      case 'transfer':
        if (selectedTable && currentOrder && !selectedTable.isVirtual) setShowTransfer(true);
        else toast.error('Please select a physical table with an order first');
        break;
      case 'print':
        if (currentOrder) setShowPrint(true);
        else toast.error('No order to print');
        break;
      case 'hold':
        if (currentOrder) setShowHold(true);
        else toast.error('No order to hold');
        break;
      case 'rush':
        handleRushOrder();
        break;
      case 'comp':
        if (currentOrder?.items?.length > 0) setShowComp(true);
        else toast.error('No items to comp');
        break;
      case 'discount':
        if (currentOrder?.items?.length > 0) setShowDiscount(true);
        else toast.error('No order to discount');
        break;
      case 'gift':
        setShowGiftCard(true);
        break;
      case 'clear':
        handleClearTable();
        break;
      default:
        toast.info(`${action} ${t('action')}`);
    }
  };

  const handlePrintConfirm = async () => {
    if (!selectedTable || !currentOrder) return;

    // Only update status if it's currently 'ordered' or 'seated'
    // Don't overwrite 'paid' or other terminal states if they exist
    if (!selectedTable.isVirtual && (selectedTable.status === 'ordered' || selectedTable.status === 'seated')) {
      const latestTable = tables.find(t => t.id === selectedTable.id);

      await updateTable.mutateAsync({
        id: selectedTable.id,
        data: {
          status: 'bill_requested',
          guests: currentOrder.guests || latestTable?.guests,
          seated_at: latestTable?.seated_at
        }
      });

      toast.success('Bill printed & status updated');
    }
  };

  // Kitchen handlers
  const handleUpdateItemStatus = async (orderId, itemIndex) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedItems = [...order.items];
    const currentStatus = updatedItems[itemIndex].status;

    // Prevent updating served items
    if (currentStatus === 'served') return;

    const nextStatus = { 'sent': 'preparing', 'preparing': 'ready', 'ready': 'sent' }[currentStatus] || 'preparing';
    updatedItems[itemIndex].status = nextStatus;

    // Check if all items are either ready or served
    const allReady = updatedItems.every(item => item.status === 'ready' || item.status === 'served');

    await updateOrder.mutateAsync({
      id: orderId,
      data: { items: updatedItems, status: allReady ? 'ready' : 'preparing' }
    });
  };

  const handleAcceptOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    await updateOrder.mutateAsync({
      id: orderId,
      data: { status: 'preparing', items: order.items.map(item => item.status === 'sent' ? { ...item, status: 'preparing' } : item) }
    });
    toast.success('Order accepted - now cooking!');
  };

  const handleMarkAllReady = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Only mark non-served items as ready
    const updatedItems = order.items.map(item =>
      item.status === 'served' ? item : { ...item, status: 'ready' }
    );

    await updateOrder.mutateAsync({
      id: orderId,
      data: { status: 'ready', items: updatedItems }
    });
    toast.success('All kitchen items marked ready!');
  };

  const handleBumpOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const nonKitchenCategories = ['beverages', 'alcohol', 'beers', 'wines', 'drinks', 'cocktails', 'coffee'];

    // Only mark kitchen items as served
    const updatedItems = order.items.map(item => {
      // Case-insensitive check for category
      const category = item.category?.toLowerCase() || '';
      if (!nonKitchenCategories.includes(category)) {
        return { ...item, status: 'served' };
      }
      return item;
    });

    // Check if all items are served to update order status
    const allServed = updatedItems.every(item => item.status === 'served');
    // If not all served, but kitchen is done, status is 'ready' (food ready) or stay 'preparing'
    // Usually 'ready' is good to indicate attention needed or partial completion
    const newStatus = allServed ? 'served' : 'ready';

    await updateOrder.mutateAsync({
      id: orderId,
      data: { status: newStatus, items: updatedItems }
    });

    if (newStatus === 'served') {
      toast.success('Order completed!');
    } else {
      toast.success('Kitchen items bumped! Drinks/others remaining.');
    }
  };

  const handleClearTable = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    // Allow clearing if table is available BUT has a lingering order
    const hasActiveOrder = currentOrder?.id && ['open', 'sent', 'preparing', 'ready', 'hold', 'served', 'paid'].includes(currentOrder.status);

    if (selectedTable.status === 'available' && !hasActiveOrder) {
      toast.info('Table is already empty');
      return;
    }

    // Handle Order Status Update
    if (currentOrder?.id) {
      if (currentOrder.status === 'paid') {
        // If paid, mark as completed (archived)
        await updateOrder.mutateAsync({
          id: currentOrder.id,
          data: { status: 'completed' }
        });
      } else if (['open', 'sent', 'preparing', 'ready', 'hold', 'served'].includes(currentOrder.status)) {
        // If active but not paid, cancel it
        await updateOrder.mutateAsync({
          id: currentOrder.id,
          data: { status: 'cancelled' }
        });
      }
    }

    // Reset the table
    if (!selectedTable.isVirtual) {
      await updateTable.mutateAsync({
        id: selectedTable.id,
        data: {
          status: 'available',
          guests: 0,
          seated_at: null,
          current_server: null
        }
      });

      // Invalidate queries to ensure FloorPlan updates immediately
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
    }

    await queryClient.invalidateQueries({ queryKey: ['orders'] });

    setCurrentOrder(null);
    setSelectedTable(null);
    toast.success('Table cleared');
  };

  const handleRushOrder = async () => {
    if (!currentOrder?.id) {
      toast.error('Please send the order first');
      return;
    }

    await updateOrder.mutateAsync({
      id: currentOrder.id,
      data: { is_rush: true }
    });
    setCurrentOrder({ ...currentOrder, is_rush: true });
    toast.success('🔥 Rush order sent to kitchen!');
  };

  const handleTransferTable = async (newTable) => {
    if (!currentOrder || !selectedTable) return;

    // Update the old table to available
    await updateTable.mutateAsync({
      id: selectedTable.id,
      data: { status: 'available', guests: 0, seated_at: null, current_server: null }
    });

    // Update the new table
    await updateTable.mutateAsync({
      id: newTable.id,
      data: {
        status: selectedTable.status,
        guests: selectedTable.guests,
        seated_at: selectedTable.seated_at,
        current_server: user?.email
      }
    });

    // Update the order
    if (currentOrder.id) {
      await updateOrder.mutateAsync({
        id: currentOrder.id,
        data: { table_id: newTable.id, table_name: newTable.name }
      });
    }

    setCurrentOrder({ ...currentOrder, table_id: newTable.id, table_name: newTable.name });
    setSelectedTable(newTable);
    toast.success(`Order transferred to ${newTable.name}`);
  };

  const handleApplyDiscount = async (discountData) => {
    const updatedOrder = {
      ...currentOrder,
      discount: discountData.amount,
      discount_type: discountData.type,
      discount_reason: discountData.reason
    };

    if (currentOrder.id) {
      await updateOrder.mutateAsync({
        id: currentOrder.id,
        data: {
          discount: discountData.amount,
          discount_type: discountData.type,
          discount_reason: discountData.reason
        }
      });
    }

    setCurrentOrder(updatedOrder);
    toast.success(`Discount of $${discountData.amount.toFixed(2)} applied`);
  };

  const handleCompItems = async (itemIndexes, reason) => {
    const updatedItems = currentOrder.items.map((item, idx) => {
      if (itemIndexes.includes(idx)) {
        return { ...item, is_comped: true, comp_reason: reason };
      }
      return item;
    });

    const updatedOrder = { ...currentOrder, items: updatedItems };

    if (currentOrder.id) {
      await updateOrder.mutateAsync({
        id: currentOrder.id,
        data: { items: updatedItems }
      });
    }

    setCurrentOrder(updatedOrder);
    toast.success(`${itemIndexes.length} item(s) comped`);
  };

  const handleHoldOrder = async (reason) => {
    if (!currentOrder.id) {
      toast.error('Please send the order first');
      return;
    }

    await updateOrder.mutateAsync({
      id: currentOrder.id,
      data: { status: 'hold', hold_reason: reason }
    });

    setCurrentOrder({ ...currentOrder, status: 'hold', hold_reason: reason });
    toast.info('Order placed on hold');
  };

  const handleResumeOrder = async () => {
    if (!currentOrder?.id) return;

    await updateOrder.mutateAsync({
      id: currentOrder.id,
      data: { status: 'open', hold_reason: null }
    });

    setCurrentOrder({ ...currentOrder, status: 'open', hold_reason: null });
    toast.success('Order resumed');
  };

  const generateGiftCardCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handlePurchaseGiftCard = async (data) => {
    const code = generateGiftCardCode();

    await base44.entities.GiftCard.create({
      code,
      initial_balance: data.amount,
      current_balance: data.amount,
      status: 'active',
      purchased_by: user?.email,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail
    });

    toast.success(`Gift card created! Code: ${code}`);

    // Add gift card purchase to current order if one exists
    if (currentOrder) {
      const newItem = {
        item_id: 'gift_card',
        name: `Gift Card (${code})`,
        price: data.amount,
        quantity: 1,
        station: null,
        modifiers: [],
        status: 'pending'
      };
      setCurrentOrder({ ...currentOrder, items: [...(currentOrder.items || []), newItem] });
    }
  };

  const handleCheckGiftCardBalance = async (code) => {
    const cards = await base44.entities.GiftCard.filter({ code });

    if (cards.length === 0) {
      return { error: 'Gift card not found' };
    }

    const card = cards[0];

    if (card.status === 'expired') {
      return { error: 'Gift card has expired' };
    }

    if (card.current_balance <= 0) {
      return { error: 'Gift card has no balance' };
    }

    return { balance: card.current_balance, card };
  };

  const handleRedeemGiftCard = async (code, amount) => {
    const cards = await base44.entities.GiftCard.filter({ code });
    if (cards.length === 0) return;

    const card = cards[0];
    const orderTotal = currentOrder?.items?.reduce((sum, item) =>
      sum + (item.price * item.quantity * (item.is_comped ? 0 : 1)), 0
    ) * 1.13 || 0; // Include tax

    const amountToUse = Math.min(card.current_balance, orderTotal);

    await base44.entities.GiftCard.update(card.id, {
      current_balance: card.current_balance - amountToUse,
      status: card.current_balance - amountToUse <= 0 ? 'used' : 'active'
    });

    // Apply as discount
    setCurrentOrder({
      ...currentOrder,
      discount: (currentOrder.discount || 0) + amountToUse,
      discount_reason: `Gift Card: ${code}`
    });

    toast.success(`$${amountToUse.toFixed(2)} applied from gift card`);
  };

  const openOrders = orders.filter(o => o.status === 'open' || o.status === 'sent');
  const kitchenOrders = orders.filter(o => o.status === 'sent' || o.status === 'preparing' || o.status === 'ready');

  const handleQuickClear = async (tableToClear, e) => {
    e?.stopPropagation(); // Prevent selecting the table when clicking clear

    // Find the active order for this table
    const activeStatuses = ['open', 'sent', 'preparing', 'ready', 'hold', 'served', 'paid'];
    let orderToClear;

    if (tableToClear.isVirtual) {
      orderToClear = orders.find(o => o.id === tableToClear.orderId);
    } else {
      orderToClear = orders.find(o => o.table_id === tableToClear.id && activeStatuses.includes(o.status));
    }

    if (!orderToClear && tableToClear.status === 'available' && !tableToClear.isVirtual) {
      return;
    }

    // Handle Order Status Update
    if (orderToClear?.id) {
      if (orderToClear.status === 'paid') {
        // If paid, mark as completed (archived)
        await updateOrder.mutateAsync({
          id: orderToClear.id,
          data: { status: 'completed' }
        });
      } else if (['open', 'sent', 'preparing', 'ready', 'hold', 'served'].includes(orderToClear.status)) {
        // If active but not paid, cancel it
        await updateOrder.mutateAsync({
          id: orderToClear.id,
          data: { status: 'cancelled' }
        });
      }
    }

    // Reset the table
    if (!tableToClear.isVirtual) {
      await updateTable.mutateAsync({
        id: tableToClear.id,
        data: {
          status: 'available',
          guests: 0,
          seated_at: null,
          current_server: null
        }
      });

      await queryClient.invalidateQueries({ queryKey: ['tables'] });
    }

    await queryClient.invalidateQueries({ queryKey: ['orders'] });

    // If the cleared table was selected, clear selection
    if (selectedTable?.id === tableToClear.id) {
      setCurrentOrder(null);
      setSelectedTable(null);
    }
    toast.success('Table cleared');
  };

  return (
    <div className="h-[100dvh] bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{t('restaurantPOS')}</h1>
              <p className="text-xs text-slate-500">{user?.full_name || t('server')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
            onClick={toggleLanguage}
            title={language === 'en' ? '切换到中文' : 'Switch to English'}
          >
            <Languages className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
            onClick={() => setActiveTab('kitchen')}
          >
            <ChefHat className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <BarChart3 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Shift Start Overlay */}
        {!activeShift && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full">
              <ShiftPanel
                shift={null}
                onStartShift={handleStartShift}
                onEndShift={handleEndShift}
                onCashDrop={handleCashDrop}
              />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="bg-slate-800/40 p-1 h-10 border border-slate-700/30 rounded-md flex gap-1">
                <button
                  onClick={() => setActiveTab('floor')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'floor'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  {t('floor')}
                </button>
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'menu'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  {t('menu')}
                </button>
                <button
                  onClick={() => setActiveTab('kitchen')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'kitchen'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <ChefHat className="w-4 h-4" />
                  {t('kitchen')}
                </button>
                <button
                  onClick={() => setActiveTab('shift')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'shift'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  {t('activeShift')}
                </button>
              </div>
            </div>

            {/* Conditionally render only the active tab */}
            <div className="flex-1 min-h-0 flex flex-col mt-0 outline-none overflow-hidden">
              {activeTab === 'floor' && (
                <FloorPlan
                  tables={allDisplayTables}
                  onTableSelect={handleTableSelect}
                  selectedTable={selectedTable}
                  onTableClear={handleQuickClear}
                />
              )}

              {activeTab === 'menu' && (
                <MenuGrid items={menuItems} onItemSelect={handleItemSelect} />
              )}

              {activeTab === 'kitchen' && (
                <div className="h-full bg-slate-900/40 border border-slate-800 rounded-2xl overflow-auto backdrop-blur-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {kitchenOrders.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                          <ChefHat className="w-10 h-10 text-slate-600" />
                        </div>
                        <p className="text-slate-500 font-medium">{language === 'en' ? 'No orders in kitchen' : '厨房暂无订单'}</p>
                      </div>
                    ) : (
                      kitchenOrders.map(order => (
                        <KitchenTicket
                          key={order.id}
                          order={order}
                          onUpdateItemStatus={handleUpdateItemStatus}
                          onBump={handleBumpOrder}
                          onAccept={handleAcceptOrder}
                          onMarkAllReady={handleMarkAllReady}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'shift' && (
                <div className="h-full flex flex-col items-center justify-center overflow-auto p-4 relative">
                  {/* Decorative background for shift tab */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent opacity-50" />
                  <div className="max-w-md w-full relative z-10">
                    <ShiftPanel
                      shift={activeShift}
                      onStartShift={handleStartShift}
                      onEndShift={handleEndShift}
                      onCashDrop={handleCashDrop}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="w-[380px] border-l border-slate-800 flex flex-col p-2 gap-2 overflow-hidden bg-slate-900/40">
          <div className="flex-1 overflow-hidden">
            <OrderPanel
              order={currentOrder}
              table={selectedTable}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onAddModifier={handleAddModifier}
              onSendOrder={handleSendOrder}
              onServeItem={handleServeItem}
              onPayment={() => setShowPayment(true)}
              onCompleteOrder={handleClearTable}
              onAdjustTip={() => {
                setTipAdjustmentAmount(currentOrder?.tip || '');
                setShowTipAdjustment(true);
              }}
            />
          </div>

          <QuickActions onAction={handleQuickAction} disabled={!selectedTable} />
        </div>
      </div>

      {/* Seat Table Dialog */}
      <Dialog open={seatDialog} onOpenChange={setSeatDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('seatTable')} {selectedTable?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">{t('numberOfGuests')}</Label>
              <div className="flex items-center gap-3 mt-2">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <Button
                    key={num}
                    variant={guestCount === num ? "default" : "outline"}
                    className={cn(
                      "w-12 h-12",
                      guestCount === num
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "border-slate-700 text-slate-400"
                    )}
                    onClick={() => setGuestCount(num)}
                  >
                    {num}
                  </Button>
                ))}
                <Input
                  type="number"
                  min="1"
                  value={guestCount > 6 ? guestCount : ''}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  placeholder="7+"
                  className="w-16 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSeatTable} className="bg-emerald-600 hover:bg-emerald-700">
              <Users className="w-4 h-4 mr-2" />
              {t('seatGuests')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        order={currentOrder}
        onProcessPayment={handlePayment}
      />

      {/* Transfer Table Modal */}
      <TransferTableModal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        tables={tables}
        currentTable={selectedTable}
        onTransfer={handleTransferTable}
      />

      {/* Discount Modal */}
      <DiscountModal
        open={showDiscount}
        onClose={() => setShowDiscount(false)}
        orderTotal={currentOrder?.items?.reduce((sum, item) =>
          sum + (item.price * item.quantity * (item.is_comped ? 0 : 1)), 0
        ) || 0}
        onApplyDiscount={handleApplyDiscount}
      />

      {/* Comp Items Modal */}
      <CompItemModal
        open={showComp}
        onClose={() => setShowComp(false)}
        items={currentOrder?.items || []}
        onCompItems={handleCompItems}
      />

      {/* Gift Card Modal */}
      <GiftCardModal
        open={showGiftCard}
        onClose={() => setShowGiftCard(false)}
        onPurchaseGiftCard={handlePurchaseGiftCard}
        onRedeemGiftCard={handleRedeemGiftCard}
        onCheckBalance={handleCheckGiftCardBalance}
      />

      {/* Hold Order Modal */}
      <HoldOrderModal
        open={showHold}
        onClose={() => setShowHold(false)}
        order={currentOrder}
        onHoldOrder={handleHoldOrder}
        onResumeOrder={handleResumeOrder}
      />

      {/* Print Receipt Modal */}
      <PrintReceiptModal
        open={showPrint}
        onClose={() => setShowPrint(false)}
        order={currentOrder}
        table={selectedTable}
        onPrintConfirm={handlePrintConfirm}
      />

      {/* Shift Report Modal */}
      <ShiftReportModal
        open={showShiftReport}
        onClose={() => setShowShiftReport(false)}
        shift={lastClosedShift}
      />

      {/* Tip Adjustment Modal */}
      <Dialog open={showTipAdjustment} onOpenChange={setShowTipAdjustment}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Adjust Tip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Tip Amount</Label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tipAdjustmentAmount}
                  onChange={(e) => setTipAdjustmentAmount(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[0, 5, 10, 15, 20].map(amt => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-700 text-slate-300"
                  onClick={() => setTipAdjustmentAmount(amt.toString())}
                >
                  ${amt}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateTip} className="bg-emerald-600 hover:bg-emerald-700 w-full">
              Update Tip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function POS() {
  return (
    <LanguageProvider>
      <POSContent />
    </LanguageProvider>
  );
}
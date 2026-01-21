import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Header
    restaurantPOS: 'RestaurantPOS',
    server: 'Server',

    // Tabs
    floor: 'Floor',
    menu: 'Menu',
    kitchen: 'Kitchen',

    // Floor Plan
    floorPlan: 'Floor Plan',
    all: 'All',
    main: 'Main',
    patio: 'Patio',
    bar: 'Bar',
    takeOut: 'Take Out',
    available: 'Available',
    seated: 'Seated',
    ordered: 'Ordered',
    billRequested: 'Bill',
    paid: 'Paid',
    reserved: 'Reserved',

    // Order Panel
    newOrder: 'New Order',
    noServer: 'No server',
    items: 'items',
    open: 'open',
    seat: 'Seat',
    noItemsYet: 'No items yet',
    selectFromMenu: 'Select items from the menu',
    addNote: 'Add Note',
    remove: 'Remove',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    send: 'Send',
    pay: 'Pay',
    addNoteModifier: 'Add Note / Modifier',
    notePlaceholder: 'e.g., No onions, Extra sauce, Medium rare...',
    noOnions: 'No onions',
    extraSauce: 'Extra sauce',
    wellDone: 'Well done',
    mediumRare: 'Medium rare',
    glutenFree: 'Gluten free',
    spicy: 'Spicy',
    selectTable: 'Select a Table',
    clickTableToStart: 'Click a table to start an order',

    // Seat Dialog
    seatTable: 'Seat Table',
    numberOfGuests: 'Number of Guests',
    seatGuests: 'Seat Guests',

    // Shift Panel
    noActiveShift: 'No Active Shift',
    startShiftDesc: 'Start a shift to begin taking orders',
    startShift: 'Start Shift',
    activeShift: 'Active Shift',
    started: 'Started',
    sales: 'Sales',
    tips: 'Tips',
    cashInDrawer: 'Cash in Drawer',
    cashDrop: 'Cash Drop',
    endShift: 'End Shift',
    startNewShift: 'Start New Shift',
    startingCash: 'Starting Cash (Blind Count)',
    startingCashDesc: 'Count your drawer without looking at the expected amount',
    blindCashDrop: 'Blind Cash Drop',
    dropAmount: 'Drop Amount',
    dropAmountDesc: 'This amount will be removed from your expected cash balance',
    confirmDrop: 'Confirm Drop',
    endShiftCashCount: 'End Shift - Cash Count',
    actualCashInDrawer: 'Actual Cash in Drawer',
    countYourDrawer: 'Count your drawer',
    drawerBalanced: 'Drawer Balanced!',
    variance: 'Variance',
    closeShift: 'Close Shift',

    // Quick Actions
    transfer: 'Transfer',
    print: 'Print',
    hold: 'Hold',
    rush: 'Rush',
    comp: 'Comp',
    discount: 'Discount',
    giftCard: 'Gift Card',

    // Payment Modal
    payment: 'Payment',
    credit: 'Credit',
    debit: 'Debit',
    cash: 'Cash',
    gift: 'Gift',
    addTip: 'Add Tip',
    custom: 'Custom',
    cashReceived: 'Cash Received',
    exact: 'Exact',
    changeDue: 'Change Due',
    splitBill: 'Split Bill',
    on: 'On',
    off: 'Off',
    eachPersonPays: 'Each person pays',
    processing: 'Processing...',
    completePayment: 'Complete Payment',
    completeTable: 'Complete Table',

    // Toasts
    tableSeated: 'seated with',
    guests: 'guests',
    orderSentToKitchen: 'Order sent to kitchen!',
    paymentComplete: 'Payment complete!',
    shiftStarted: 'Shift started!',
    shiftEnded: 'Shift ended!',
    cashDropRecorded: 'Cash drop recorded',
    selectDestinationTable: 'Select destination table',
    printingReceipt: 'Printing receipt...',
    orderOnHold: 'Order on hold',
    rushOrderSent: 'Rush order sent to kitchen!',
    action: 'action',
    pleaseAddItems: 'Please add items to the order first',
    pleaseSelectTable: 'Please select a table first',

    // Menu Categories
    appetizers: 'Appetizers',
    mains: 'Mains',
    sides: 'Sides',
    desserts: 'Desserts',
    beverages: 'Beverages',
    alcohol: 'Alcohol',
    specials: 'Specials',
    dumplings: 'Dumplings',
    noodles: 'Noodles',
    bings: 'Bings',
    rice: 'Rice',
    beers: 'Beers',
    wines: 'Wines',
    lunch_specials: 'Lunch Specials',
    searchMenu: 'Search menu...',
  },
  zh: {
    // Header
    restaurantPOS: '餐厅POS系统',
    server: '服务员',

    // Tabs
    floor: '楼层',
    menu: '菜单',
    kitchen: '厨房',

    // Floor Plan
    floorPlan: '楼层平面图',
    all: '全部',
    main: '大厅',
    patio: '露台',
    bar: '吧台',
    takeOut: '外卖',
    available: '空闲',
    seated: '已入座',
    ordered: '已点餐',
    billRequested: '买单',
    reserved: '已预订',

    // Order Panel
    newOrder: '新订单',
    noServer: '无服务员',
    items: '项',
    open: '进行中',
    seat: '座位',
    noItemsYet: '暂无菜品',
    selectFromMenu: '从菜单选择菜品',
    addNote: '添加备注',
    remove: '删除',
    subtotal: '小计',
    tax: '税费',
    total: '合计',
    send: '发送',
    pay: '结账',
    addNoteModifier: '添加备注/修改',
    notePlaceholder: '例如：不要洋葱、多加酱汁、五分熟...',
    noOnions: '不要洋葱',
    extraSauce: '多加酱汁',
    wellDone: '全熟',
    mediumRare: '五分熟',
    glutenFree: '无麸质',
    spicy: '加辣',
    selectTable: '请选择餐桌',
    clickTableToStart: '点击餐桌开始点餐',

    // Seat Dialog
    seatTable: '安排座位',
    numberOfGuests: '客人数量',
    seatGuests: '安排入座',

    // Shift Panel
    noActiveShift: '无进行中班次',
    startShiftDesc: '开始班次以接受订单',
    startShift: '开始班次',
    activeShift: '进行中班次',
    started: '开始于',
    sales: '销售额',
    tips: '小费',
    cashInDrawer: '收银台现金',
    cashDrop: '现金存入',
    endShift: '结束班次',
    startNewShift: '开始新班次',
    startingCash: '初始现金（盲点）',
    startingCashDesc: '不看预期金额直接清点收银台',
    blindCashDrop: '盲存现金',
    dropAmount: '存入金额',
    dropAmountDesc: '此金额将从预期现金余额中扣除',
    confirmDrop: '确认存入',
    endShiftCashCount: '结束班次 - 现金清点',
    actualCashInDrawer: '收银台实际现金',
    countYourDrawer: '清点收银台',
    drawerBalanced: '收银台平衡！',
    variance: '差异',
    closeShift: '关闭班次',

    // Quick Actions
    transfer: '转台',
    print: '打印',
    hold: '暂停',
    rush: '加急',
    comp: '赠送',
    discount: '折扣',
    giftCard: '礼品卡',
    forceEmpty: '强制清台',

    // Payment Modal
    payment: '支付',
    credit: '信用卡',
    debit: '借记卡',
    cash: '现金',
    gift: '礼品卡',
    addTip: '添加小费',
    custom: '自定义',
    cashReceived: '收到现金',
    exact: '正好',
    changeDue: '找零',
    splitBill: '分单',
    on: '开',
    off: '关',
    eachPersonPays: '每人支付',
    processing: '处理中...',
    completePayment: '完成支付',
    completeTable: '完成/清台',

    // Toasts
    tableSeated: '已入座',
    guests: '位客人',
    orderSentToKitchen: '订单已发送至厨房！',
    paymentComplete: '支付完成！',
    shiftStarted: '班次已开始！',
    shiftEnded: '班次已结束！',
    cashDropRecorded: '现金存入已记录',
    selectDestinationTable: '选择目标餐桌',
    printingReceipt: '正在打印收据...',
    orderOnHold: '订单已暂停',
    rushOrderSent: '加急订单已发送至厨房！',
    action: '操作',
    pleaseAddItems: '请先添加菜品',
    pleaseSelectTable: '请先选择餐桌',

    // Menu Categories
    appetizers: '开胃菜',
    mains: '主菜',
    sides: '配菜',
    desserts: '甜点',
    beverages: '饮料',
    alcohol: '酒水',
    specials: '特色菜',
    dumplings: '饺子',
    noodles: '面条',
    bings: '饼类',
    rice: '米饭',
    beers: '啤酒',
    wines: '葡萄酒',
    lunch_specials: '特价午餐',
    searchMenu: '搜索菜单...',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language][key] || key;

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Download, Calendar, DollarSign, UtensilsCrossed, Wine } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function DailySalesReport({ open, onClose, selectedDate = new Date() }) {
    const reportRef = useRef(null);

    // Fetch completed and paid orders for the selected date
    const { data: allOrders = [] } = useQuery({
        queryKey: ['daily-report-orders', selectedDate],
        queryFn: async () => {
            const [paid, completed] = await Promise.all([
                base44.entities.Order.filter({ status: 'paid' }),
                base44.entities.Order.filter({ status: 'completed' })
            ]);

            const orders = [...paid, ...completed];

            // Filter by selected date
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            return orders.filter(o => {
                const orderDate = new Date(o.closed_at || o.created_date);
                return orderDate >= startOfDay && orderDate <= endOfDay;
            });
        },
        enabled: open
    });

    // Fetch transactions for payment breakdown
    const { data: transactions = [] } = useQuery({
        queryKey: ['daily-report-transactions', selectedDate],
        queryFn: async () => {
            // Fetch all transactions and filter client-side for reliability
            const allTransactions = await base44.entities.Transaction.list();

            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            return allTransactions.filter(t => {
                // Check if it's a payment and within date range
                if (t.type !== 'payment') return false;

                const transDate = new Date(t.created_date || t.created_at); // Handle potential field name variations
                return transDate >= startOfDay && transDate <= endOfDay;
            });
        },
        enabled: open
    });

    // Food categories
    const foodCategories = ['appetizers', 'salads', 'soups', 'entrees', 'mains', 'sides', 'desserts', 'lunch special', 'lunch specials', 'lunch_specials', 'rice', 'bings', 'noodles', 'dim_sum'];
    // Beverage categories
    const beverageCategories = ['beverages', 'drinks', 'coffee', 'tea', 'soft drinks', 'juice'];
    // Alcohol categories
    const alcoholCategories = ['alcohol', 'beer', 'beers', 'wine', 'wines', 'cocktails', 'liquor', 'spirits'];

    // Calculate Sales Breakdown
    let foodSales = 0;
    let lunchSpecialSales = 0;
    let foodComps = 0;
    let foodDiscounts = 0;

    let beverageSales = 0;
    let alcoholSales = 0;
    let beverageComps = 0;
    let beverageDiscounts = 0;

    allOrders.forEach(order => {
        order.items?.forEach(item => {
            const category = (item.category || '').toLowerCase();
            const itemTotal = item.price * item.quantity;

            if (beverageCategories.includes(category) || alcoholCategories.includes(category)) {
                if (item.is_comped) {
                    beverageComps += itemTotal;
                } else {
                    if (alcoholCategories.includes(category)) {
                        alcoholSales += itemTotal;
                    } else {
                        beverageSales += itemTotal;
                    }
                }
            } else {
                // Default to Food for any other category
                if (item.is_comped) {
                    foodComps += itemTotal;
                } else {
                    foodSales += itemTotal;

                    // Check if it's a lunch special
                    if (category.includes('lunch special') || category.includes('lunch_special')) {
                        lunchSpecialSales += itemTotal;
                    }
                }
            }
        });

        // Apportion discounts
        if (order.discount && order.items?.length > 0) {
            const bevItems = order.items.filter(item =>
                beverageCategories.includes((item.category || '').toLowerCase()) ||
                alcoholCategories.includes((item.category || '').toLowerCase())
            );
            const foodItemsCount = order.items.length - bevItems.length;
            const bevItemsCount = bevItems.length;
            const totalItems = order.items.length;

            if (totalItems > 0) {
                if (foodItemsCount > 0) {
                    const foodDiscount = (order.discount * foodItemsCount) / totalItems;
                    foodDiscounts += foodDiscount;
                }
                if (bevItemsCount > 0) {
                    const bevDiscount = (order.discount * bevItemsCount) / totalItems;
                    beverageDiscounts += bevDiscount;
                }
            }
        }
    });

    const totalFoodSales = foodSales - foodDiscounts;

    const totalBeverageSales = (beverageSales + alcoholSales) - beverageDiscounts;

    // Total Sales
    const grossFoodSales = foodSales + foodComps;
    const grossBeverageSales = beverageSales + alcoholSales + beverageComps;
    const totalGrossSales = grossFoodSales + grossBeverageSales;
    const totalDiscounts = foodDiscounts + beverageDiscounts;
    const totalComps = foodComps + beverageComps;
    const netSales = totalFoodSales + totalBeverageSales;

    // Payment Method Breakdown
    const creditCardPayments = transactions.filter(t => t.method === 'credit').reduce((sum, t) => sum + (t.amount || 0), 0);
    const debitCardPayments = transactions.filter(t => t.method === 'debit').reduce((sum, t) => sum + (t.amount || 0), 0);
    const cashPayments = transactions.filter(t => t.method === 'cash').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPayments = creditCardPayments + debitCardPayments + cashPayments;

    // Tips
    const totalTips = transactions.reduce((sum, t) => sum + (t.tip || 0), 0);

    // Tax
    // Calculate dynamically from Net Sales to ensure consistency with calculated sales figures
    // and ignore potential stale tax values in the database
    const totalTax = netSales * 0.13;

    // Guest count
    const totalGuests = allOrders.reduce((sum, o) => sum + (o.guests || 0), 0);
    const transactionCount = allOrders.length;
    const avgCheck = transactionCount > 0 ? netSales / transactionCount : 0;

    const handlePrint = () => {
        const printContent = reportRef.current?.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Daily Sales Report - ${format(selectedDate, 'MMM dd, yyyy')}</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', system-ui, sans-serif; 
                            padding: 40px; 
                            max-width: 900px; 
                            margin: 0 auto;
                            line-height: 1.5;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 4px solid #000; 
                            padding-bottom: 25px; 
                            margin-bottom: 35px; 
                        }
                        .header h1 {
                            margin: 0 0 10px 0;
                            font-size: 32px;
                            font-weight: 700;
                            letter-spacing: 1px;
                        }
                        .header .subtitle {
                            font-size: 18px;
                            color: #666;
                            margin: 5px 0;
                        }
                        .section {
                            margin-bottom: 30px;
                            page-break-inside: avoid;
                        }
                        .section-title {
                            font-size: 18px;
                            font-weight: 700;
                            text-transform: uppercase;
                            border-bottom: 3px solid #10b981;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                            color: #1f2937;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        .row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 15px;
                            margin: 3px 0;
                        }
                        .row:nth-child(even) {
                            background: #f9fafb;
                        }
                        .row-label {
                            color: #4b5563;
                            font-weight: 500;
                        }
                        .row-value {
                            font-weight: 600;
                            color: #1f2937;
                        }
                        .row.indent {
                            padding-left: 35px;
                            font-size: 14px;
                        }
                        .row.indent .row-label {
                            color: #6b7280;
                        }
                        .row.subtotal {
                            background: #e5e7eb !important;
                            font-weight: 700;
                            border-top: 2px solid #d1d5db;
                            border-bottom: 2px solid #d1d5db;
                            margin: 10px 0;
                        }
                        .row.total {
                            background: #10b981 !important;
                            color: white !important;
                            font-weight: 700;
                            font-size: 20px;
                            padding: 15px;
                            margin: 15px 0;
                            border-radius: 8px;
                        }
                        .row.total .row-label,
                        .row.total .row-value {
                            color: white !important;
                        }
                        .row.negative .row-value {
                            color: #dc2626;
                        }
                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 15px;
                            margin: 20px 0;
                        }
                        .stat-card {
                            background: #f8f9fa;
                            padding: 20px;
                            border-radius: 10px;
                            border-left: 5px solid #3b82f6;
                            text-align: center;
                        }
                        .stat-label {
                            font-size: 13px;
                            color: #6b7280;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 8px;
                        }
                        .stat-value {
                            font-size: 28px;
                            font-weight: 700;
                            color: #1f2937;
                        }
                        .divider {
                            border-top: 2px solid #e5e7eb;
                            margin: 25px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 50px;
                            padding-top: 25px;
                            border-top: 3px solid #000;
                            font-size: 13px;
                            color: #6b7280;
                        }
                        @media print {
                            body { padding: 20px; }
                        }
                    </style>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExport = () => {
        // Create CSV data
        const csvData = [
            ['DAILY SALES REPORT'],
            [`Date: ${format(selectedDate, 'EEEE, MMMM dd, yyyy')}`],
            [''],
            ['FOOD SALES'],
            ['Food Sales', `$${foodSales.toFixed(2)}`],
            ['Lunch Special', `$${lunchSpecialSales.toFixed(2)}`],
            ['Food Comps', `-$${foodComps.toFixed(2)}`],
            ['Food Discounts', `-$${foodDiscounts.toFixed(2)}`],
            ['Total Food Sales', `$${totalFoodSales.toFixed(2)}`],
            [''],
            ['BEVERAGE SALES'],
            ['Non-Alcoholic Beverages', `$${beverageSales.toFixed(2)}`],
            ['Liquor/Wine/Beer', `$${alcoholSales.toFixed(2)}`],
            ['Beverage Comps', `-$${beverageComps.toFixed(2)}`],
            ['Beverage Discounts', `-$${beverageDiscounts.toFixed(2)}`],
            ['Total Beverage Sales', `$${totalBeverageSales.toFixed(2)}`],
            [''],
            ['NET SALES', `$${netSales.toFixed(2)}`],
            ['Tax', `$${totalTax.toFixed(2)}`],
            ['Tips', `$${totalTips.toFixed(2)} (${netSales > 0 ? ((totalTips / netSales) * 100).toFixed(1) : '0.0'}%)`],
            ['GROSS REVENUE (Excl. Tips)', `$${(netSales + totalTax).toFixed(2)}`],
            [''],
            ['PAYMENT METHODS'],
            ['Credit Card', `$${creditCardPayments.toFixed(2)}`],
            ['Debit Card', `$${debitCardPayments.toFixed(2)}`],
            ['Cash', `$${cashPayments.toFixed(2)}`],
            ['Total Payments', `$${totalPayments.toFixed(2)}`],
            [''],
            ['PERFORMANCE METRICS'],
            ['Total Transactions', `${transactionCount}`],
            ['Total Guests Served', `${totalGuests}`],
            ['Average Check Size', `$${avgCheck.toFixed(2)}`]
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-sales-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Daily Sales Report
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-white rounded-lg p-8 text-black shadow-xl max-h-[70vh] overflow-y-auto">
                    <div ref={reportRef}>
                        {/* Header */}
                        <div className="header">
                            <h1>DAILY SALES REPORT</h1>
                            <div className="subtitle">
                                {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                            </div>
                            <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '10px' }}>
                                Report Generated: {format(new Date(), 'MMM dd, yyyy • h:mm a')}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="stats-grid">
                            <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
                                <div className="stat-label">Gross Revenue (Excl. Tips)</div>
                                <div className="stat-value">${(netSales + totalTax).toFixed(2)}</div>
                            </div>
                            <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
                                <div className="stat-label">Transactions</div>
                                <div className="stat-value">{transactionCount}</div>
                            </div>
                            <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                                <div className="stat-label">Guests Served</div>
                                <div className="stat-value">{totalGuests}</div>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Food Sales Section */}
                        <div className="section">
                            <div className="section-title">
                                <UtensilsCrossed style={{ width: '20px', height: '20px' }} />
                                FOOD SALES
                            </div>

                            <div className="row">
                                <span className="row-label">Food Sales</span>
                                <span className="row-value">${foodSales.toFixed(2)}</span>
                            </div>
                            <div className="row indent">
                                <span className="row-label">• Lunch Special</span>
                                <span className="row-value">${lunchSpecialSales.toFixed(2)}</span>
                            </div>
                            <div className="row negative">
                                <span className="row-label">Food Comps</span>
                                <span className="row-value">-${foodComps.toFixed(2)}</span>
                            </div>
                            <div className="row negative">
                                <span className="row-label">Food Discounts</span>
                                <span className="row-value">-${foodDiscounts.toFixed(2)}</span>
                            </div>
                            <div className="row subtotal">
                                <span className="row-label">TOTAL FOOD SALES</span>
                                <span className="row-value">${totalFoodSales.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Beverage Sales Section */}
                        <div className="section">
                            <div className="section-title">
                                <Wine style={{ width: '20px', height: '20px' }} />
                                BEVERAGE SALES
                            </div>

                            <div className="row">
                                <span className="row-label">Non-Alcoholic Beverages</span>
                                <span className="row-value">${beverageSales.toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span className="row-label">Liquor / Wine / Beer</span>
                                <span className="row-value">${alcoholSales.toFixed(2)}</span>
                            </div>
                            <div className="row negative">
                                <span className="row-label">Beverage Comps</span>
                                <span className="row-value">-${beverageComps.toFixed(2)}</span>
                            </div>
                            <div className="row negative">
                                <span className="row-label">Beverage Discounts</span>
                                <span className="row-value">-${beverageDiscounts.toFixed(2)}</span>
                            </div>
                            <div className="row subtotal">
                                <span className="row-label">TOTAL BEVERAGE SALES</span>
                                <span className="row-value">${totalBeverageSales.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Total Sales */}
                        <div className="row total">
                            <span className="row-label">NET SALES</span>
                            <span className="row-value">${netSales.toFixed(2)}</span>
                        </div>

                        {/* Summary Details */}
                        <div className="section" style={{ marginTop: '30px' }}>
                            <div className="row">
                                <span className="row-label">Tax Collected</span>
                                <span className="row-value">${totalTax.toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span className="row-label">Tips ({netSales > 0 ? ((totalTips / netSales) * 100).toFixed(1) : '0.0'}%)</span>
                                <span className="row-value">${totalTips.toFixed(2)}</span>
                            </div>
                            <div className="row subtotal">
                                <span className="row-label">GROSS REVENUE (Excl. Tips)</span>
                                <span className="row-value">${(netSales + totalTax).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Payment Methods */}
                        <div className="section">
                            <div className="section-title">
                                <DollarSign style={{ width: '20px', height: '20px' }} />
                                PAYMENT METHODS
                            </div>

                            <div className="row">
                                <span className="row-label">Credit Card Payments</span>
                                <span className="row-value">${creditCardPayments.toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span className="row-label">Debit Card Payments</span>
                                <span className="row-value">${debitCardPayments.toFixed(2)}</span>
                            </div>
                            <div className="row">
                                <span className="row-label">Cash Payments</span>
                                <span className="row-value">${cashPayments.toFixed(2)}</span>
                            </div>
                            <div className="row subtotal">
                                <span className="row-label">TOTAL PAYMENTS</span>
                                <span className="row-value">${totalPayments.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Performance Metrics */}
                        <div className="section">
                            <div className="section-title">PERFORMANCE METRICS</div>

                            <div className="row">
                                <span className="row-label">Total Transactions</span>
                                <span className="row-value">{transactionCount}</span>
                            </div>
                            <div className="row">
                                <span className="row-label">Total Guests Served</span>
                                <span className="row-value">{totalGuests}</span>
                            </div>
                            <div className="row">
                                <span className="row-label">Average Check Size</span>
                                <span className="row-value">${avgCheck.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="footer">
                            <p>This report is generated electronically by the RestaurantFlow POS system.</p>
                            <p style={{ marginTop: '10px' }}>
                                All figures are based on completed transactions for the business day shown above.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
                        <X className="w-4 h-4 mr-2" />
                        Close
                    </Button>
                    <Button variant="outline" onClick={handleExport} className="border-emerald-700 text-emerald-400 hover:bg-emerald-950">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

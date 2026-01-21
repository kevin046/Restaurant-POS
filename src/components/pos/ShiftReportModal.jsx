import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Clock, DollarSign, Receipt, TrendingUp } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

export default function ShiftReportModal({
    open,
    onClose,
    shift
}) {
    const reportRef = useRef(null);

    if (!shift) return null;

    const totalSales = shift.total_sales || 0;
    const totalTips = shift.total_tips || 0;
    const startCash = shift.starting_cash || 0;
    const expectedCash = shift.expected_cash || 0;
    const actualCash = shift.actual_cash || 0;
    const variance = actualCash - expectedCash;
    const drops = shift.cash_drops || [];
    const totalDrops = drops.reduce((sum, drop) => sum + drop.amount, 0);
    const ordersCount = shift.orders_count || 0;
    const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

    // Calculate shift duration
    const startTime = shift.started_at ? new Date(shift.started_at) : null;
    const endTime = shift.ended_at ? new Date(shift.ended_at) : new Date();
    const duration = startTime ? differenceInMinutes(endTime, startTime) : 0;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    const handlePrint = () => {
        const printContent = reportRef.current?.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>Shift Report - ${shift.server_name || 'Server'}</title>
          <style>
            body { 
              font-family: 'Segoe UI', system-ui, sans-serif; 
              padding: 30px; 
              max-width: 800px; 
              margin: 0 auto;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #000; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 1px;
            }
            .header .meta {
              color: #666;
              font-size: 14px;
            }
            .section { 
              margin-bottom: 25px; 
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              text-transform: uppercase;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 8px;
              margin-bottom: 15px;
              color: #333;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0;
              padding: 6px 0;
            }
            .row.highlight {
              background: #f5f5f5;
              padding: 10px;
              margin: 10px -10px;
              border-radius: 4px;
            }
            .row.total {
              font-weight: 700;
              font-size: 18px;
              border-top: 2px solid #000;
              margin-top: 15px;
              padding-top: 12px;
            }
            .row-label {
              color: #555;
            }
            .row-value {
              font-weight: 600;
              color: #000;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 15px 0;
            }
            .stat-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #10b981;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: #000;
            }
            .divider { 
              border-top: 1px solid #e0e0e0; 
              margin: 20px 0; 
            }
            .cash-drop {
              background: #fff3cd;
              padding: 8px 12px;
              margin: 5px 0;
              border-left: 3px solid #ffc107;
              font-size: 14px;
            }
            .variance {
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-size: 20px;
              font-weight: 700;
              margin: 15px 0;
            }
            .variance.positive {
              background: #d4edda;
              color: #155724;
              border: 2px solid #c3e6cb;
            }
            .variance.negative {
              background: #f8d7da;
              color: #721c24;
              border: 2px solid #f5c6cb;
            }
            .variance.zero {
              background: #e2e3e5;
              color: #383d41;
              border: 2px solid #d6d8db;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 2px solid #000;
              font-size: 12px;
              color: #666;
            }
            .signatures {
              display: flex;
              justify-content: space-around;
              margin-top: 50px;
            }
            .signature-line {
              width: 200px;
              text-align: center;
            }
            .signature-line .line {
              border-top: 2px solid #000;
              margin-bottom: 5px;
            }
            @media print {
              body { padding: 15px; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Shift Report
                    </DialogTitle>
                </DialogHeader>

                <div className="bg-white rounded-lg p-8 text-black shadow-xl max-h-[70vh] overflow-y-auto">
                    <div ref={reportRef}>
                        {/* Header */}
                        <div className="header">
                            <h1>SERVER SHIFT REPORT</h1>
                            <div className="meta">
                                <strong>{shift.server_name || 'Server'}</strong>
                                <br />
                                <span>Report Generated: {format(new Date(), 'EEEE, MMMM dd, yyyy • h:mm a')}</span>
                            </div>
                        </div>

                        {/* Shift Details */}
                        <div className="section">
                            <div className="section-title">
                                <Clock style={{ width: '18px', height: '18px' }} />
                                SHIFT DETAILS
                            </div>
                            <div className="grid">
                                <div>
                                    <div className="row">
                                        <span className="row-label">Shift ID:</span>
                                        <span className="row-value">#{shift.id?.slice(0, 12)}</span>
                                    </div>
                                    <div className="row">
                                        <span className="row-label">Server:</span>
                                        <span className="row-value">{shift.server_name || shift.server || 'Unknown'}</span>
                                    </div>
                                    <div className="row">
                                        <span className="row-label">Status:</span>
                                        <span className="row-value" style={{ color: shift.status === 'active' ? '#10b981' : '#6b7280' }}>
                                            {shift.status === 'active' ? 'ACTIVE' : 'CLOSED'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="row">
                                        <span className="row-label">Started:</span>
                                        <span className="row-value">
                                            {startTime ? format(startTime, 'MMM dd, yyyy • h:mm a') : '-'}
                                        </span>
                                    </div>
                                    <div className="row">
                                        <span className="row-label">Ended:</span>
                                        <span className="row-value">
                                            {shift.ended_at ? format(endTime, 'MMM dd, yyyy • h:mm a') : 'Active'}
                                        </span>
                                    </div>
                                    <div className="row">
                                        <span className="row-label">Duration:</span>
                                        <span className="row-value">
                                            {duration > 0 ? `${hours}h ${minutes}m` : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Sales Summary */}
                        <div className="section">
                            <div className="section-title">
                                <DollarSign style={{ width: '18px', height: '18px' }} />
                                SALES SUMMARY
                            </div>

                            <div className="grid">
                                <div className="stat-box">
                                    <div className="stat-label">Total Sales</div>
                                    <div className="stat-value">${totalSales.toFixed(2)}</div>
                                </div>
                                <div className="stat-box" style={{ borderLeftColor: '#3b82f6' }}>
                                    <div className="stat-label">Total Tips</div>
                                    <div className="stat-value">${totalTips.toFixed(2)}</div>
                                </div>
                                <div className="stat-box" style={{ borderLeftColor: '#f59e0b' }}>
                                    <div className="stat-label">Transactions</div>
                                    <div className="stat-value">{ordersCount}</div>
                                </div>
                                <div className="stat-box" style={{ borderLeftColor: '#8b5cf6' }}>
                                    <div className="stat-label">Avg Order Value</div>
                                    <div className="stat-value">${avgOrderValue.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="row total">
                                <span>TOTAL REVENUE (Sales + Tips):</span>
                                <span>${(totalSales + totalTips).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="divider" />

                        {/* Cash Management */}
                        <div className="section">
                            <div className="section-title">
                                <TrendingUp style={{ width: '18px', height: '18px' }} />
                                CASH MANAGEMENT
                            </div>

                            <div className="row highlight">
                                <span className="row-label">Starting Cash Drawer:</span>
                                <span className="row-value">${startCash.toFixed(2)}</span>
                            </div>

                            {drops.length > 0 && (
                                <div style={{ margin: '15px 0' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>
                                        Cash Drops ({drops.length})
                                    </div>
                                    {drops.map((drop, i) => (
                                        <div key={i} className="cash-drop">
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{format(new Date(drop.time), 'MMM dd • h:mm a')}</span>
                                                <span style={{ fontWeight: 600 }}>-${drop.amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="row" style={{ fontWeight: 600, marginTop: '10px' }}>
                                        <span>Total Cash Drops:</span>
                                        <span style={{ color: '#d97706' }}>-${totalDrops.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="row" style={{ fontWeight: 600, fontSize: '16px', marginTop: '15px' }}>
                                <span>Expected Cash in Drawer:</span>
                                <span>${expectedCash.toFixed(2)}</span>
                            </div>

                            <div className="row" style={{ fontWeight: 600, fontSize: '16px' }}>
                                <span>Actual Cash Counted:</span>
                                <span>${actualCash.toFixed(2)}</span>
                            </div>

                            <div className={`variance ${variance > 0 ? 'positive' : variance < 0 ? 'negative' : 'zero'}`}>
                                <div style={{ fontSize: '14px', marginBottom: '5px' }}>CASH VARIANCE</div>
                                <div>{variance > 0 ? '+' : ''}${variance.toFixed(2)}</div>
                                {variance !== 0 && (
                                    <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'normal' }}>
                                        {variance > 0 ? 'Cash Over' : 'Cash Short'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="footer">
                            <p style={{ marginBottom: '10px' }}>
                                This report is generated electronically by the RestaurantFlow POS system.
                            </p>
                            <div className="signatures">
                                <div className="signature-line">
                                    <div style={{ height: '60px' }}></div>
                                    <div className="line"></div>
                                    <div>Server Signature</div>
                                </div>
                                <div className="signature-line">
                                    <div style={{ height: '60px' }}></div>
                                    <div className="line"></div>
                                    <div>Manager Signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
                        <X className="w-4 h-4 mr-2" />
                        Close
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

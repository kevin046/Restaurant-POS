import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, Check } from 'lucide-react';

export default function TransferTableModal({ 
  open, 
  onClose, 
  tables, 
  currentTable,
  onTransfer 
}) {
  const [selectedTable, setSelectedTable] = useState(null);
  
  const availableTables = tables.filter(t => 
    t.id !== currentTable?.id && t.status === 'available'
  );

  const handleTransfer = () => {
    if (selectedTable) {
      onTransfer(selectedTable);
      setSelectedTable(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Transfer {currentTable?.name} to...
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {availableTables.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No available tables</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-center",
                    selectedTable?.id === table.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  )}
                >
                  <span className={cn(
                    "text-lg font-bold",
                    selectedTable?.id === table.id ? "text-emerald-400" : "text-white"
                  )}>
                    {table.name}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {table.capacity} seats
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={!selectedTable}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
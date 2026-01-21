import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, MapPin, Loader2, Circle, Square, RectangleHorizontal } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sections = ['Main', 'Patio', 'Bar', 'TakeOut'];
const shapes = [
  { value: 'square', label: 'Square', icon: Square },
  { value: 'round', label: 'Round', icon: Circle },
  { value: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal }
];

const emptyTable = {
  name: '',
  capacity: 4,
  section: 'Main',
  shape: 'square',
  status: 'available'
};

export default function TableSetup() {
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState(emptyTable);
  const [activeSection, setActiveSection] = useState('All');

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => base44.entities.Table.list()
  });

  const createTable = useMutation({
    mutationFn: (data) => base44.entities.Table.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      toast.success('Table created');
    }
  });

  const updateTable = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Table.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      toast.success('Table updated');
    }
  });

  const deleteTable = useMutation({
    mutationFn: (id) => base44.entities.Table.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      toast.success('Table deleted');
    }
  });

  const filteredTables = activeSection === 'All'
    ? tables
    : tables.filter(t => t.section === activeSection);

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData(table);
    setEditDialog(true);
  };

  const handleCreate = () => {
    setEditingTable(null);
    setFormData(emptyTable);
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Table name is required');
      return;
    }

    if (editingTable) {
      await updateTable.mutateAsync({ id: editingTable.id, data: formData });
    } else {
      await createTable.mutateAsync(formData);
    }
    setEditDialog(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this table?')) {
      await deleteTable.mutateAsync(id);
    }
  };

  const handleQuickAdd = async (section, count = 1) => {
    const sectionTables = tables.filter(t => t.section === section);
    const prefix = section === 'Bar' ? 'B' : section === 'Patio' ? 'P' : section === 'TakeOut' ? 'TO' : 'T';

    for (let i = 0; i < count; i++) {
      const num = sectionTables.length + i + 1;
      await createTable.mutateAsync({
        name: `${prefix}${num}`,
        capacity: section === 'Bar' ? 2 : section === 'TakeOut' ? 1 : 4,
        section,
        shape: section === 'Bar' ? 'round' : section === 'TakeOut' ? 'rectangle' : 'square',
        status: 'available'
      });
    }
    toast.success(`Added ${count} table(s) to ${section}`);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header & Controls (Fixed) */}
      <div className="p-6 pb-2 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Table Setup</h1>
            <p className="text-slate-500">Configure your restaurant floor plan</p>
          </div>
          <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2">
          {['All', ...sections].map(section => (
            <Button
              key={section}
              variant={activeSection === section ? "default" : "outline"}
              className={cn(
                activeSection === section
                  ? "bg-white text-slate-900"
                  : "border-slate-700 text-slate-400 hover:bg-slate-800"
              )}
              onClick={() => setActiveSection(section)}
            >
              {section}
              {section !== 'All' && (
                <Badge variant="secondary" className="ml-2 bg-slate-700">
                  {tables.filter(t => t.section === section).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-slate-500 self-center mr-2">Quick add:</span>
          {sections.map(section => (
            <Button
              key={section}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-400 hover:bg-slate-800"
              onClick={() => handleQuickAdd(section)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {section} Table
            </Button>
          ))}
        </div>
      </div>

      {/* Tables Grid (Scrollable Area) */}
      <div className="flex-1 overflow-auto p-6 pt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-10">
            {filteredTables.map(table => {
              const ShapeIcon = shapes.find(s => s.value === table.shape)?.icon || Square;
              return (
                <Card
                  key={table.id}
                  className="bg-slate-900/50 border-slate-800 overflow-hidden hover:border-slate-700 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        table.shape === 'round' && "rounded-full",
                        "bg-slate-800 border-2 border-slate-700"
                      )}>
                        <span className="text-lg font-bold text-white">{table.name}</span>
                      </div>
                      <Badge variant="outline" className="border-slate-700 text-slate-400">
                        {table.capacity}
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {table.section}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShapeIcon className="w-3 h-3" />
                        {table.shape}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-1 text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => handleEdit(table)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        onClick={() => handleDelete(table.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredTables.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 mb-4">No tables in this section</p>
            <Button onClick={handleCreate} variant="outline" className="border-slate-700 text-slate-400">
              <Plus className="w-4 h-4 mr-2" />
              Add First Table
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTable ? 'Edit Table' : 'Add Table'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Table Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., T1, Bar-1, P5"
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Capacity</Label>
                <Select
                  value={String(formData.capacity)}
                  onValueChange={(v) => setFormData({ ...formData, capacity: parseInt(v) })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                      <SelectItem key={num} value={String(num)}>{num} seats</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-400">Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(v) => setFormData({ ...formData, section: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {sections.map(section => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-400">Shape</Label>
              <div className="flex gap-2 mt-2">
                {shapes.map(shape => (
                  <Button
                    key={shape.value}
                    variant={formData.shape === shape.value ? "default" : "outline"}
                    className={cn(
                      "flex-1 gap-2",
                      formData.shape === shape.value
                        ? "bg-white text-slate-900"
                        : "border-slate-700 text-slate-400"
                    )}
                    onClick={() => setFormData({ ...formData, shape: shape.value })}
                  >
                    <shape.icon className="w-4 h-4" />
                    {shape.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} className="border-slate-700 text-slate-400">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingTable ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
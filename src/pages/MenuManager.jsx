import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, Search, UtensilsCrossed,
  Flame, Snowflake, Wine, Coffee, Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from '@/components/pos/LanguageContext';

const categories = ['appetizers', 'mains', 'sides', 'desserts', 'beverages', 'alcohol', 'specials'];
const stations = ['grill', 'saute', 'cold', 'bar', 'dessert'];

const categoryColors = {
  appetizers: 'bg-green-500/20 text-green-400 border-green-500/30',
  mains: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  sides: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  desserts: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  beverages: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  alcohol: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  specials: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
};

const stationIcons = {
  grill: Flame,
  saute: Flame,
  cold: Snowflake,
  bar: Wine,
  dessert: Coffee
};

const emptyItem = {
  name: '',
  category: 'mains',
  price: 0,
  description: '',
  station: 'grill',
  prep_time: 15,
  is_available: true,
  modifiers: []
};

export default function MenuManager() {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editDialog, setEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyItem);

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => base44.entities.MenuItem.list()
  });

  const createItem = useMutation({
    mutationFn: (data) => base44.entities.MenuItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Menu item created');
    }
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MenuItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Menu item updated');
    }
  });

  const deleteItem = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-items']);
      toast.success('Menu item deleted');
    }
  });

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setEditDialog(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(emptyItem);
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    if (editingItem) {
      await updateItem.mutateAsync({ id: editingItem.id, data: formData });
    } else {
      await createItem.mutateAsync(formData);
    }
    setEditDialog(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem.mutateAsync(id);
    }
  };

  const handleToggleAvailability = async (item) => {
    await updateItem.mutateAsync({
      id: item.id,
      data: { is_available: !item.is_available }
    });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header & Filters Section (Fixed) */}
      <div className="p-6 pb-0 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Menu Manager</h1>
            <p className="text-slate-500">Manage your restaurant menu items</p>
          </div>
          <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-800 text-white"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-800 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Grid (Scrollable) */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredItems.map(item => {
              const StationIcon = stationIcons[item.station] || UtensilsCrossed;
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "bg-slate-900/50 border-slate-800 overflow-hidden transition-all",
                    !item.is_available && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">
                          {language === 'zh' ? (item.name_zh || item.name) : item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn("text-xs", categoryColors[item.category])}>
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                            <StationIcon className="w-3 h-3 mr-1" />
                            {item.station}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-emerald-400">
                        ${item.price?.toFixed(2)}
                      </p>
                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={() => handleToggleAvailability(item)}
                        />
                        <span className="text-xs text-slate-500">
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-rose-400"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredItems.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">No menu items found</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-400">Prep Time (min)</Label>
                <Input
                  type="number"
                  value={formData.prep_time}
                  onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) || 0 })}
                  className="bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-400">Kitchen Station</Label>
                <Select
                  value={formData.station}
                  onValueChange={(v) => setFormData({ ...formData, station: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    {stations.map(station => (
                      <SelectItem key={station} value={station} className="capitalize">{station}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-400">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
              <Label className="text-slate-400">Available for ordering</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)} className="border-slate-700 text-slate-400">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
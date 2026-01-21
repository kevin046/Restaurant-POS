import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Search, Flame, Wine, Utensils, Coffee, IceCream, Sparkles, Salad, X, ChevronRight, Menu as MenuIcon, LayoutGrid, Check, GripVertical } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useLanguage } from './LanguageContext';
import { motion, AnimatePresence, Reorder } from "framer-motion";

const categoryIcons = {
  appetizers: Salad,
  mains: Utensils,
  sides: Coffee,
  desserts: IceCream,
  beverages: Coffee,
  alcohol: Wine,
  specials: Sparkles,
  dumplings: Utensils,
  noodles: Flame,
  bings: Sparkles,
  rice: Utensils,
  beers: Wine,
  wines: Wine,
  lunch_specials: Sparkles
};

// Map categories to border colors for the vertical menu
const categoryBorderColors = {
  appetizers: 'border-orange-500 text-orange-500',
  mains: 'border-red-600 text-red-600',
  sides: 'border-yellow-500 text-yellow-500',
  desserts: 'border-pink-400 text-pink-400',
  beverages: 'border-sky-400 text-sky-400',
  alcohol: 'border-purple-600 text-purple-600',
  specials: 'border-rose-500 text-rose-500',
  dumplings: 'border-amber-800 text-amber-800',
  noodles: 'border-orange-400 text-orange-400',
  bings: 'border-pink-400 text-pink-400',
  rice: 'border-white text-slate-200',
  beers: 'border-amber-400 text-amber-400',
  wines: 'border-rose-900 text-rose-900',
  lunch_specials: 'border-yellow-400 text-yellow-400',
  all: 'border-slate-500 text-slate-400'
};

const categoryColors = {
  appetizers: 'bg-gradient-to-br from-orange-500/25 to-orange-600/10 border-orange-500/30 hover:border-orange-500/50 hover:from-orange-500/30 hover:to-orange-600/20 shadow-orange-900/10 group-hover:shadow-orange-900/20',
  mains: 'bg-gradient-to-br from-red-600/25 to-red-800/10 border-red-600/30 hover:border-red-600/50 hover:from-red-600/30 hover:to-red-800/20 shadow-red-900/10 group-hover:shadow-red-900/20',
  sides: 'bg-gradient-to-br from-yellow-500/20 to-yellow-700/10 border-yellow-500/30 hover:border-yellow-500/50 hover:from-yellow-500/30 hover:to-yellow-700/20 shadow-yellow-900/10 group-hover:shadow-yellow-900/20',
  desserts: 'bg-gradient-to-br from-pink-500/25 to-pink-700/10 border-pink-500/30 hover:border-pink-500/50 hover:from-pink-500/30 hover:to-pink-700/20 shadow-pink-900/10 group-hover:shadow-pink-900/20',
  beverages: 'bg-gradient-to-br from-sky-500/25 to-sky-700/10 border-sky-500/30 hover:border-sky-500/50 hover:from-sky-500/30 hover:to-sky-700/20 shadow-sky-900/10 group-hover:shadow-sky-900/20',
  alcohol: 'bg-gradient-to-br from-purple-600/25 to-purple-800/10 border-purple-600/30 hover:border-purple-600/50 hover:from-purple-600/30 hover:to-purple-800/20 shadow-purple-900/10 group-hover:shadow-purple-900/20',
  specials: 'bg-gradient-to-br from-rose-500/25 to-rose-700/10 border-rose-500/30 hover:border-rose-500/50 hover:from-rose-500/30 hover:to-rose-700/20 shadow-rose-900/10 group-hover:shadow-rose-900/20',
  dumplings: 'bg-gradient-to-br from-amber-700/30 to-amber-900/20 border-amber-700/40 hover:border-amber-700/60 hover:from-amber-700/40 hover:to-amber-900/30 shadow-amber-900/10 group-hover:shadow-amber-900/20',
  noodles: 'bg-gradient-to-br from-orange-400/25 to-orange-600/10 border-orange-400/30 hover:border-orange-400/50 hover:from-orange-400/30 hover:to-orange-600/20 shadow-orange-900/10 group-hover:shadow-orange-900/20',
  bings: 'bg-gradient-to-br from-pink-400/25 to-pink-600/10 border-pink-400/30 hover:border-pink-400/50 hover:from-pink-400/30 hover:to-pink-600/20 shadow-pink-900/10 group-hover:shadow-pink-900/20',
  rice: 'bg-gradient-to-br from-slate-100/10 to-slate-300/5 border-slate-200/20 hover:border-slate-200/40 hover:from-slate-100/20 hover:to-slate-300/10 shadow-slate-900/10 group-hover:shadow-slate-900/20',
  beers: 'bg-gradient-to-br from-amber-500/25 to-amber-700/10 border-amber-500/30 hover:border-amber-500/50 hover:from-amber-500/30 hover:to-amber-700/20 shadow-amber-900/10 group-hover:shadow-amber-900/20',
  wines: 'bg-gradient-to-br from-rose-900/50 to-rose-950/40 border-rose-800/40 hover:border-rose-800/60 hover:from-rose-900/60 hover:to-rose-950/50 shadow-rose-900/10 group-hover:shadow-rose-900/20',
  lunch_specials: 'bg-gradient-to-br from-yellow-500/25 to-yellow-700/10 border-yellow-500/30 hover:border-yellow-500/50 hover:from-yellow-500/30 hover:to-yellow-700/20 shadow-yellow-900/10 group-hover:shadow-yellow-900/20'
};

export default function MenuGrid({ items, onItemSelect }) {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const [localCategories, setLocalCategories] = useState([]);
  const scrollRef = useRef(null);

  // Sync localItems when items prop changes, respecting saved order
  useEffect(() => {
    try {
      const savedOrder = JSON.parse(localStorage.getItem('menuOrder') || '[]');
      if (savedOrder.length > 0) {
        const itemsMap = new Map(items.map(i => [i.id, i]));
        
        // Reconstruct list based on saved order
        const ordered = savedOrder
          .map(id => itemsMap.get(id))
          .filter(item => item !== undefined);
          
        // Append new items
        const savedIds = new Set(savedOrder);
        const newItems = items.filter(i => !savedIds.has(i.id));
        
        setLocalItems([...ordered, ...newItems]);
      } else {
        setLocalItems(items);
      }
    } catch (e) {
      console.error('Error loading menu order:', e);
      setLocalItems(items);
    }
  }, [items]);

  // Sync localCategories when items change, respecting saved order
  useEffect(() => {
    try {
      // Get all unique categories from items
      const currentCategories = [...new Set(items.map(i => i.category))];
      const savedCategoryOrder = JSON.parse(localStorage.getItem('categoryOrder') || '[]');
      
      if (savedCategoryOrder.length > 0) {
        // Filter saved categories to only include those that still exist
        const validSavedCategories = savedCategoryOrder.filter(c => currentCategories.includes(c));
        const savedSet = new Set(validSavedCategories);
        
        // Find new categories that weren't in saved order
        const newCategories = currentCategories.filter(c => !savedSet.has(c));
        
        // Combine: Saved Order + New Categories
        setLocalCategories([...validSavedCategories, ...newCategories]);
      } else {
        // Default order if no save exists
        setLocalCategories(currentCategories);
      }
    } catch (e) {
      console.error('Error loading category order:', e);
      setLocalCategories([...new Set(items.map(i => i.category))]);
    }
  }, [items]);

  const filteredItems = localItems.filter(item => {
    const itemName = language === 'zh' ? (item.name_zh || item.name) : item.name;
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch && item.is_available !== false;
  });

  const handleReorder = (newOrderedItems) => {
    // We need to merge the new order of the filtered items back into the main list
    const visibleIds = new Set(filteredItems.map(i => i.id));
    
    // Keep items that are NOT currently visible in their original order
    const otherItems = localItems.filter(i => !visibleIds.has(i.id));
    
    // Combine them (visible items moved to the end in their new order)
    const newItems = [...otherItems, ...newOrderedItems];
    setLocalItems(newItems);
    
    // Save order to localStorage
    try {
      localStorage.setItem('menuOrder', JSON.stringify(newItems.map(i => i.id)));
    } catch (e) {
      console.error('Error saving menu order:', e);
    }
  };

  const handleCategoryReorder = (newOrderedCategories) => {
    setLocalCategories(newOrderedCategories);
    try {
      localStorage.setItem('categoryOrder', JSON.stringify(newOrderedCategories));
    } catch (e) {
      console.error('Error saving category order:', e);
    }
  };

  // Reset scroll on category change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCategory, search]);

  const getCategoryLabel = (cat) => {
    const labels = {
      all: t('all'),
      appetizers: t('appetizers'),
      mains: t('mains'),
      sides: t('sides'),
      desserts: t('desserts'),
      beverages: t('beverages'),
      alcohol: t('alcohol'),
      specials: t('specials'),
      dumplings: t('dumplings'),
      noodles: t('noodles'),
      bings: t('bings'),
      rice: t('rice'),
      beers: t('beers'),
      wines: t('wines'),
      lunch_specials: t('lunch_specials')
    };
    return labels[cat] || cat;
  };

  return (
    <div
      className="flex-1 h-full w-full min-h-0 flex flex-col md:flex-row bg-slate-950/50 border border-slate-800/60 rounded-3xl backdrop-blur-2xl overflow-hidden shadow-2xl"
    >
      {/* Vertical Navigation Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-800/50 bg-slate-900/60 backdrop-blur-xl h-[35vh] md:h-full">
        {/* Sticky Header: Search & Edit Toggle */}
        <div className="p-4 border-b border-slate-800/50 sticky top-0 bg-slate-900/95 z-20 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input
                placeholder={t('searchMenu')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-slate-950/50 border-slate-700/50 text-white placeholder:text-slate-600 rounded-xl focus:ring-1 focus:ring-emerald-500/50 text-sm transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsReordering(!isReordering)}
              className={cn(
                "p-2.5 rounded-xl border transition-all duration-200",
                isReordering 
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                  : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              title={isReordering ? "Save Layout" : "Edit Layout"}
            >
              {isReordering ? <Check className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
          </div>
          
          {isReordering && (
            <div className="text-xs text-center text-emerald-400 font-medium animate-pulse">
              Drag items to reorder
            </div>
          )}
        </div>

        {/* Scrollable Category List */}
        <div className="flex-1 overflow-y-scroll overflow-x-hidden custom-scrollbar overscroll-contain">
          <div className="flex flex-col p-2 space-y-1 pb-12">
            {/* "All" Category - Fixed at top */}
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left group w-full border-l-[3px]",
                activeCategory === 'all'
                  ? "bg-slate-800 text-white shadow-md border-slate-500"
                  : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <Utensils className={cn(
                "w-4 h-4 transition-colors",
                activeCategory === 'all' ? "text-slate-400" : "text-slate-500 group-hover:text-slate-400"
              )} />
              <span className="flex-1 truncate">{t('all')}</span>
              {activeCategory === 'all' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>

            {/* Reorderable Categories */}
            <Reorder.Group axis="y" values={localCategories} onReorder={handleCategoryReorder} className="space-y-1">
              {localCategories.map(cat => {
                const Icon = categoryIcons[cat] || Utensils;
                const isActive = activeCategory === cat;
                const colorStyle = categoryBorderColors[cat] || 'border-slate-500 text-slate-400';
                
                return (
                  <Reorder.Item
                    key={cat}
                    value={cat}
                    dragListener={isReordering}
                    className="relative"
                    whileDrag={{ scale: 1.05, zIndex: 50 }}
                  >
                    <button
                      onClick={() => !isReordering && setActiveCategory(cat)}
                      className={cn(
                        "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left group w-full border-l-[3px]",
                        isActive 
                          ? cn("bg-slate-800 text-white shadow-md", colorStyle.split(' ')[0]) // Apply border color
                          : "border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                        isReordering && "cursor-grab active:cursor-grabbing hover:bg-slate-800/30 border-dashed border-slate-700/50"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? colorStyle.split(' ')[1] : "text-slate-500 group-hover:text-slate-400"
                      )} />
                      <span className="flex-1 truncate">{getCategoryLabel(cat)}</span>
                      
                      {isActive && !isReordering && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}

                      {isReordering && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        </div>
        
        {/* Sticky Footer (Optional info) */}
        <div className="p-3 border-t border-slate-800/50 text-xs text-center text-slate-600 bg-slate-900/90 sticky bottom-0 z-10">
          {filteredItems.length} items found
        </div>
      </div>

      {/* Main Content Area - Grid */}
      <div
        ref={scrollRef}
        key={language}
        className="flex-1 w-full min-h-0 overflow-y-scroll overflow-x-hidden p-4 md:p-6 custom-scrollbar bg-slate-950/30 overscroll-contain"
      >
        <Reorder.Group 
          axis="y" 
          values={filteredItems} 
          onReorder={handleReorder}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-32"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/30 rounded-3xl border-dashed"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 shadow-inner">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg font-medium">{t('noItemsYet') || "No items found"}</p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory('all'); }}
                  className="mt-6 px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/20 transition-colors font-semibold"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              filteredItems.map((item) => {
                const itemName = language === 'zh' ? (item.name_zh || item.name) : item.name;
                const altName = language === 'zh' ? item.name : item.name_zh;
                const colorClass = categoryColors[item.category] || categoryColors.mains;

                return (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    dragListener={isReordering}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: isReordering ? 1.05 : 1.02, y: isReordering ? -5 : -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => !isReordering && onItemSelect(item)}
                    className={cn(
                      "group relative flex flex-col justify-between p-4 h-full min-h-[160px] border rounded-2xl transition-all shadow-lg text-left overflow-hidden",
                      colorClass,
                      isReordering && "cursor-grab active:cursor-grabbing hover:shadow-xl ring-2 ring-transparent hover:ring-emerald-500/50"
                    )}
                  >
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 w-full mb-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={cn(
                          "font-bold text-white leading-tight break-words",
                          language === 'zh' ? "text-lg tracking-wide" : "text-base"
                        )}>
                          {itemName}
                        </h3>
                        {item.station === 'grill' && (
                          <div className="p-1 rounded-full bg-orange-500/10 text-orange-400 shrink-0">
                            <Flame className="w-3 h-3" />
                          </div>
                        )}
                        {isReordering && (
                          <div className="absolute right-0 top-0 p-1.5 rounded-full bg-black/40 text-white/70 backdrop-blur-sm">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {altName && (
                        <p className="text-xs text-slate-400 font-medium mt-1 truncate opacity-70 group-hover:opacity-100 transition-opacity">
                          {altName}
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 flex items-end justify-between mt-auto pt-3 border-t border-white/10">
                      <span className="text-lg font-bold text-white tracking-tight">
                        ${item.price.toFixed(2)}
                      </span>
                      {!isReordering && (
                        <div className="h-7 w-7 rounded-full bg-black/20 group-hover:bg-emerald-500 text-white flex items-center justify-center transition-colors shadow-sm">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </Reorder.Item>
                );
              })
            )}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </div>
  );
}
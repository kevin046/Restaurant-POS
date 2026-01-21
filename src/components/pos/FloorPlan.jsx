import React, { useState } from 'react';
import TableCard from './TableCard';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function FloorPlan({ tables, onTableSelect, selectedTable, onTableClear }) {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState('All');

  const sections = [
    { key: 'All', label: t('all') },
    { key: 'Main', label: t('main') },
    { key: 'Patio', label: t('patio') },
    { key: 'Bar', label: t('bar') },
    { key: 'TakeOut', label: t('takeOut') }
  ];

  const filteredTables = activeSection === 'All'
    ? tables
    : tables.filter(t => t.section === activeSection);

  const groupedTables = filteredTables.reduce((acc, table) => {
    const section = table.section || 'Main';
    if (!acc[section]) acc[section] = [];
    acc[section].push(table);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Unified Header & Status Legend */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <MapPin className="w-4 h-4 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{t('floorPlan')}</h2>
          </div>

          <div className="flex items-center gap-3 ml-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('available')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('seated')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('ordered')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('billRequested')}</span>
            </div>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="shrink-0">
          <TabsList className="bg-slate-800/50 h-9 p-1">
            {sections.map(section => (
              <TabsTrigger
                key={section.key}
                value={section.key}
                className="text-xs px-3 data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400"
              >
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {Object.keys(groupedTables).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/30">
              <MapPin className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('noTables')}</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              {language === 'en'
                ? 'Your floor plan is currently empty. Go to Table Setup to add tables to your restaurant.'
                : '平面图目前为空。请前往桌位设置添加餐厅桌位。'}
            </p>
          </div>
        ) : (
          Object.entries(groupedTables).map(([section, sectionTables]) => (
            <div key={section} className="mb-8 last:mb-0">
              {activeSection === 'All' && (
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-slate-800/30 border border-slate-700/30">
                    {t(section.toLowerCase())}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {sectionTables.map(table => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onClick={onTableSelect}
                    isSelected={selectedTable?.id === table.id}
                    onClear={onTableClear}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
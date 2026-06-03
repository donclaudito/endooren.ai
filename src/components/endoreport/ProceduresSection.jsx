import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROCEDURES, PROCEDURE_CATEGORIES, CATEGORY_COLORS } from '@/utils/proceduresDb';

export default function ProceduresSection({ data, setData }) {
  const [expandedCategories, setExpandedCategories] = useState(
    Object.fromEntries(PROCEDURE_CATEGORIES.map(c => [c, false]))
  );

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const updateProc = (id, field, value) => {
    setData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  const toggleProc = (id, proc) => {
    const current = data[id]?.selected;
    setData(prev => ({
      ...prev,
      [id]: {
        selected: !current,
        subtype: proc.subtypes?.[0]?.id || null,
        count: proc.countDefault || 1,
        ...(prev[id] || {})
      }
    }));
  };

  const selectedCount = Object.values(data).filter(v => v?.selected).length;

  // Group procedures by category
  const byCategory = PROCEDURE_CATEGORIES.map(cat => ({
    cat,
    procs: PROCEDURES.filter(p => p.category === cat)
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-700">Procedimentos Realizados</h2>
            <p className="text-xs text-slate-400">Selecione os procedimentos terapêuticos e diagnósticos</p>
          </div>
        </div>
        {selectedCount > 0 && (
          <Badge className="bg-violet-100 text-violet-700 font-bold">
            {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Categories */}
      <div className="divide-y divide-slate-100">
        {byCategory.map(({ cat, procs }) => {
          const colors = CATEGORY_COLORS[cat];
          const catSelectedCount = procs.filter(p => data[p.id]?.selected).length;
          const isOpen = expandedCategories[cat];

          return (
            <div key={cat}>
              {/* Category header — clickable */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full px-4 lg:px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className="text-sm font-semibold text-slate-600">{cat}</span>
                  {catSelectedCount > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {catSelectedCount}
                    </span>
                  )}
                </div>
                {isOpen
                  ? <ChevronDown className="w-4 h-4 text-slate-400" />
                  : <ChevronRight className="w-4 h-4 text-slate-400" />
                }
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className={`px-4 lg:px-6 pb-4 pt-2 space-y-3 ${colors.bg}`}>
                      {procs.map(proc => {
                        const state = data[proc.id] || {};
                        const isSelected = !!state.selected;

                        return (
                          <div
                            key={proc.id}
                            className={`rounded-lg border p-3 transition-all ${
                              isSelected
                                ? `${colors.border} bg-white shadow-sm`
                                : 'border-transparent bg-white/60'
                            }`}
                          >
                            {/* Procedure checkbox */}
                            <label className="flex items-start gap-3 cursor-pointer">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleProc(proc.id, proc)}
                                className={isSelected ? `data-[state=checked]:${colors.dot.replace('bg-', 'bg-')}` : ''}
                              />
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-semibold ${isSelected ? colors.text : 'text-slate-600'}`}>
                                  {proc.name}
                                </span>
                              </div>
                            </label>

                            {/* Sub-options when selected */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 ml-7 space-y-2">
                                    {/* Subtype selector */}
                                    {proc.subtypes && proc.subtypes.length > 0 && (
                                      <div>
                                        <span className="text-xs text-slate-500 font-medium block mb-1">Protocolo / Tipo</span>
                                        <Select
                                          value={state.subtype || proc.subtypes[0].id}
                                          onValueChange={(v) => updateProc(proc.id, 'subtype', v)}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {proc.subtypes.map(sub => (
                                              <SelectItem key={sub.id} value={sub.id} className="text-xs">
                                                {sub.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}

                                    {/* Count / numeric field */}
                                    {proc.hasCount && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{proc.countLabel}:</span>
                                        <Input
                                          type="number"
                                          min={1}
                                          max={99}
                                          value={state.count ?? proc.countDefault ?? 1}
                                          onChange={(e) => updateProc(proc.id, 'count', parseInt(e.target.value) || 1)}
                                          className="w-16 h-8 text-center text-sm p-1"
                                        />
                                      </div>
                                    )}

                                    {/* Volume field for injecao adrenalina */}
                                    {proc.id === 'injecao' && state.subtype === 'adrenalina' && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Volume (mL):</span>
                                        <Input
                                          type="number"
                                          min={1}
                                          max={50}
                                          value={state.volume ?? 5}
                                          onChange={(e) => updateProc(proc.id, 'volume', parseInt(e.target.value) || 5)}
                                          className="w-16 h-8 text-center text-sm p-1"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

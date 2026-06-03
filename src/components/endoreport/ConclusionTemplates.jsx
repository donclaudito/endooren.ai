import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, X, PlusCircle, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConclusionTemplates({ templates = [], onApplyTemplate, onClearTemplates, activeTemplates = [] }) {
  const [selectKey, setSelectKey] = useState(0); // force reset of select after apply

  const handleSelect = (content) => {
    onApplyTemplate(content);
    // Reset the select so the same item can be picked again
    setSelectKey(k => k + 1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-700">Conclusões Adicionais</h2>
            <p className="text-xs text-slate-400">Templates para adicionar à conclusão do laudo</p>
          </div>
        </div>
        {activeTemplates.length > 0 && (
          <button
            onClick={onClearTemplates}
            className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar tudo
          </button>
        )}
      </div>

      <div className="px-4 lg:px-6 py-4 space-y-4">
        {/* Selector */}
        {templates.length > 0 ? (
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
            <Select key={selectKey} onValueChange={handleSelect}>
              <SelectTrigger className="flex-1 bg-slate-50 border-slate-200 text-sm">
                <SelectValue placeholder="Selecione um template de conclusão..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.content} className="text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">{t.name}</span>
                      {t.category && (
                        <span className="text-xs text-slate-400">{t.category}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PlusCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum template de conclusão cadastrado.</p>
            <p className="text-xs mt-1">
              Vá em <strong>Configurações → Templates</strong> e crie um com categoria <strong>Conclusão</strong>.
            </p>
          </div>
        )}

        {/* Active template chips */}
        <AnimatePresence>
          {activeTemplates.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Adicionados à conclusão ({activeTemplates.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {activeTemplates.map((tpl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium px-2.5 py-1.5 rounded-full max-w-xs"
                  >
                    <span className="truncate">{tpl.name}</span>
                    <button
                      onClick={() => onApplyTemplate(null, idx)}
                      className="shrink-0 hover:text-red-600 transition-colors ml-0.5"
                      title="Remover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

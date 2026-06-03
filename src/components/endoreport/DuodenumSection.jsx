import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DuodenumSection({ isNormal, setIsNormal, data, setData, templates, onApplyTemplate }) {
  const updateData = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">3</div>
          <h2 className="text-lg font-bold text-slate-700">Duodeno</h2>
        </div>
        <label className="inline-flex items-center cursor-pointer select-none gap-3">
          <Switch
            checked={isNormal}
            onCheckedChange={setIsNormal}
            className="data-[state=checked]:bg-sky-500"
          />
          <span className={`text-sm font-semibold w-16 ${isNormal ? 'text-slate-500' : 'text-red-500'}`}>
            {isNormal ? 'Normal' : 'Alterado'}
          </span>
        </label>
      </div>

      {/* Templates Selector */}
      {templates && templates.length > 0 && (
        <div className="px-4 lg:px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            Templates Rápidos
          </span>
          <Select onValueChange={(val) => onApplyTemplate(val)}>
            <SelectTrigger className="w-[200px] h-8 bg-white border-slate-200 text-xs">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.content} className="text-xs">
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Options */}
      <AnimatePresence>
        {!isNormal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 lg:px-6 pb-6 pt-4 space-y-3">
              <label className="flex items-center space-x-2 p-3 bg-slate-50 rounded border border-slate-100 cursor-pointer">
                <Checkbox checked={data.duodenite} onCheckedChange={(v) => updateData('duodenite', v)} />
                <span className="font-medium text-sm">Duodenite Erosiva</span>
              </label>

              <label className="flex items-center space-x-2 p-3 bg-slate-50 rounded border border-slate-100 cursor-pointer">
                <Checkbox checked={data.ulcera} onCheckedChange={(v) => updateData('ulcera', v)} />
                <span className="font-medium text-sm">Úlcera Bulbar</span>
              </label>

              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center space-x-2 mb-2 text-orange-700 cursor-pointer">
                  <Checkbox
                    checked={data.celiaca}
                    onCheckedChange={(v) => updateData('celiaca', v)}
                    className="data-[state=checked]:bg-orange-600"
                  />
                  <span className="font-bold text-sm">Suspeita Doença Celíaca</span>
                </label>
                {data.celiaca && (
                  <div className="pl-6 mb-3 space-y-2 border-l-2 border-orange-100 ml-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={data.celAtrofia}
                        onCheckedChange={(v) => updateData('celAtrofia', v)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                      <span className="text-xs text-slate-600">Atrofia de vilosidades</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={data.celMosaico}
                        onCheckedChange={(v) => updateData('celMosaico', v)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                      <span className="text-xs text-slate-600">Aspecto em Mosaico</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={data.celSerrilhado}
                        onCheckedChange={(v) => updateData('celSerrilhado', v)}
                        className="data-[state=checked]:bg-orange-500"
                      />
                      <span className="text-xs text-slate-600">Serrilhado de pregas</span>
                    </label>
                  </div>
                )}

                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={data.diverticulo} onCheckedChange={(v) => updateData('diverticulo', v)} />
                  <span className="text-sm">Divertículo Periampular</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
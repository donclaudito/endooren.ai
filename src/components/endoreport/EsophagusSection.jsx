import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EsophagusSection({ isNormal, setIsNormal, data, setData }) {
  const updateData = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">1</div>
          <h2 className="text-lg font-bold text-slate-700">Esôfago</h2>
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
            <div className="px-4 lg:px-6 pb-6 pt-4 space-y-4">
              
              {/* Neoplasia */}
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                  <Checkbox
                    checked={data.neoplasia}
                    onCheckedChange={(v) => updateData('neoplasia', v)}
                    className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <span className="font-bold text-sm text-red-800">Suspeita de Neoplasia</span>
                </label>
                {data.neoplasia && (
                  <div className="ml-6 space-y-3 mt-2 border-l-2 border-red-200 pl-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-red-500 font-bold mb-1 block">Tipo</span>
                        <Select value={data.neoTipo} onValueChange={(v) => updateData('neoTipo', v)}>
                          <SelectTrigger className="border-red-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vegetante">Vegetante</SelectItem>
                            <SelectItem value="ulcerada">Ulcerada</SelectItem>
                            <SelectItem value="infiltrativa">Infiltrativa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <span className="text-xs text-red-500 font-bold mb-1 block">Local</span>
                        <Select value={data.neoLocal} onValueChange={(v) => updateData('neoLocal', v)}>
                          <SelectTrigger className="border-red-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="terço distal">Terço Distal</SelectItem>
                            <SelectItem value="terço médio">Terço Médio</SelectItem>
                            <SelectItem value="terço superior">Terço Superior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={data.neoEstenose}
                        onCheckedChange={(v) => updateData('neoEstenose', v)}
                        className="data-[state=checked]:bg-red-600"
                      />
                      <span className="text-xs text-red-700 font-medium">Estenose?</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  {/* Esofagite */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                      <Checkbox checked={data.esofagite} onCheckedChange={(v) => updateData('esofagite', v)} />
                      <span className="font-medium text-sm">Esofagite (LA)</span>
                    </label>
                    <Select value={data.grauEsofagite} onValueChange={(v) => updateData('grauEsofagite', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grau A</SelectItem>
                        <SelectItem value="B">Grau B</SelectItem>
                        <SelectItem value="C">Grau C</SelectItem>
                        <SelectItem value="D">Grau D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hérnia */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={data.hernia} onCheckedChange={(v) => updateData('hernia', v)} />
                      <span className="font-medium text-sm">Hérnia Hiatal</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={data.tamHernia}
                        onChange={(e) => updateData('tamHernia', parseInt(e.target.value) || 0)}
                        className="w-14 p-1 text-sm text-center"
                      />
                      <span className="text-xs text-slate-500">cm</span>
                    </div>
                  </div>

                  {/* Eosinofílica */}
                  <label className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <Checkbox checked={data.eosinofilica} onCheckedChange={(v) => updateData('eosinofilica', v)} />
                    <span className="text-sm">Suspeita Esofagite Eosinofílica</span>
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Varizes */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                      <Checkbox
                        checked={data.varizes}
                        onCheckedChange={(v) => updateData('varizes', v)}
                        className="data-[state=checked]:bg-red-500"
                      />
                      <span className="font-medium text-sm">Varizes</span>
                    </label>
                    {data.varizes && (
                      <div className="space-y-2 mt-2">
                        <Select value={data.varizesCalibre} onValueChange={(v) => updateData('varizesCalibre', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fino">Fino</SelectItem>
                            <SelectItem value="medio">Médio</SelectItem>
                            <SelectItem value="grosso">Grosso</SelectItem>
                          </SelectContent>
                        </Select>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={data.varizesRedSpots}
                            onCheckedChange={(v) => updateData('varizesRedSpots', v)}
                            className="data-[state=checked]:bg-red-600"
                          />
                          <span className="text-xs font-bold">Sinais Vermelhos</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Barrett */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={data.barrett}
                          onCheckedChange={(v) => updateData('barrett', v)}
                          className="data-[state=checked]:bg-orange-500"
                        />
                        <span className="font-medium text-sm">Barrett</span>
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-orange-300 hover:text-orange-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-slate-800 text-white">
                          <p className="font-bold text-orange-300 mb-1">Classificação de Praga (C&M)</p>
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            <li><strong>C (Circunferencial):</strong> Extensão circunferencial da metaplasia.</li>
                            <li><strong>M (Máxima):</strong> Extensão máxima da lingueta.</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {data.barrett && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">C (cm)</span>
                            <Input
                              type="number"
                              value={data.barrettC}
                              onChange={(e) => updateData('barrettC', parseInt(e.target.value) || 0)}
                              className="w-full p-1 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">M (cm)</span>
                            <Input
                              type="number"
                              value={data.barrettM}
                              onChange={(e) => updateData('barrettM', parseInt(e.target.value) || 0)}
                              className="w-full p-1 text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-orange-50 p-2 rounded border border-orange-100 mt-1">
                          <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Protocolo Seattle</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-4 h-4 text-orange-400 hover:text-orange-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-800 text-white">
                              <p className="font-bold text-orange-300 mb-1">Protocolo de Seattle</p>
                              <p className="text-xs">Biópsias de 4 quadrantes a cada:</p>
                              <ul className="list-disc pl-4 text-xs space-y-1 mt-1">
                                <li><strong>2 cm:</strong> Sem displasia.</li>
                                <li><strong>1 cm:</strong> Com displasia conhecida.</li>
                                <li>Frascos separados por nível.</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Other options */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox checked={data.candida} onCheckedChange={(v) => updateData('candida', v)} />
                    <span className="text-sm">Candidíase</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3 h-3 text-sky-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-slate-800 text-white">
                        <p className="font-bold text-sky-300 mb-1">Classificação de Kodsi</p>
                        <ul className="list-disc pl-4 text-xs space-y-1">
                          <li><strong>I:</strong> Poucas placas brancas &lt; 2mm.</li>
                          <li><strong>II:</strong> Múltiplas placas &gt; 2mm.</li>
                          <li><strong>III:</strong> Placas confluentes.</li>
                          <li><strong>IV:</strong> Estenose ou estreitamento.</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  {data.candida && (
                    <Select value={data.candidaKodsi} onValueChange={(v) => updateData('candidaKodsi', v)}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">Kodsi I</SelectItem>
                        <SelectItem value="II">Kodsi II</SelectItem>
                        <SelectItem value="III">Kodsi III</SelectItem>
                        <SelectItem value="IV">Kodsi IV</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={data.estenose} onCheckedChange={(v) => updateData('estenose', v)} />
                  <span className="text-sm">Estenose</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={data.ulcera} onCheckedChange={(v) => updateData('ulcera', v)} />
                  <span className="text-sm">Úlcera</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={data.diverticulo} onCheckedChange={(v) => updateData('diverticulo', v)} />
                  <span className="text-sm">Divertículo</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={data.malloryWeiss} onCheckedChange={(v) => updateData('malloryWeiss', v)} />
                  <span className="text-sm">Mallory-Weiss</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
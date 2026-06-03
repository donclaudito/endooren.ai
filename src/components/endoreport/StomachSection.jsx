import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StomachSection({ isNormal, setIsNormal, data, setData, templates, onApplyTemplate }) {
  const updateData = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">2</div>
          <h2 className="text-lg font-bold text-slate-700">Estômago</h2>
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
            <div className="px-4 lg:px-6 pb-6 pt-4 space-y-4">
              
              {/* Neoplasia */}
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <label className="flex items-center space-x-2 mb-2 cursor-pointer">
                  <Checkbox
                    checked={data.neoplasia}
                    onCheckedChange={(v) => updateData('neoplasia', v)}
                    className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <span className="font-bold text-sm text-red-800">Suspeita de Câncer Gástrico</span>
                </label>
                {data.neoplasia && (
                  <div className="ml-6 space-y-3 mt-2 border-l-2 border-red-200 pl-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-red-500 font-bold">Borrmann</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="w-3 h-3 text-red-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-slate-800 text-white">
                              <p className="font-bold text-red-300 mb-1">Classificação de Borrmann</p>
                              <ul className="list-disc pl-4 text-xs space-y-1">
                                <li><strong>I:</strong> Polipóide / Vegetante.</li>
                                <li><strong>II:</strong> Ulcerado (bordas nítidas).</li>
                                <li><strong>III:</strong> Ulcerado-Infiltrativo.</li>
                                <li><strong>IV:</strong> Infiltrativo Difuso (Linite).</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={data.neoBorrmann} onValueChange={(v) => updateData('neoBorrmann', v)}>
                          <SelectTrigger className="border-red-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="I">I</SelectItem>
                            <SelectItem value="II">II</SelectItem>
                            <SelectItem value="III">III</SelectItem>
                            <SelectItem value="IV">IV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <span className="text-xs text-red-500 font-bold mb-1 block">Local</span>
                        <Select value={data.neoLocal} onValueChange={(v) => updateData('neoLocal', v)}>
                          <SelectTrigger className="border-red-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Antro">Antro</SelectItem>
                            <SelectItem value="Corpo">Corpo</SelectItem>
                            <SelectItem value="Fundo">Fundo</SelectItem>
                            <SelectItem value="Cárdia">Cárdia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gastrite */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <label className="flex items-center space-x-2 mb-3 cursor-pointer">
                  <Checkbox
                    checked={data.gastrite}
                    onCheckedChange={(v) => updateData('gastrite', v)}
                    className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                  />
                  <h3 className="text-sm font-bold text-slate-700">Gastrite &amp; Inflamação</h3>
                </label>
                {data.gastrite && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-6">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Padrão</span>
                      <Select value={data.gastriteTipo} onValueChange={(v) => updateData('gastriteTipo', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Enantematosa">Enantematosa</SelectItem>
                          <SelectItem value="Erosiva Plana">Erosiva Plana</SelectItem>
                          <SelectItem value="Erosiva Elevada">Erosiva Elevada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Intensidade</span>
                      <Select value={data.gastriteIntensidade} onValueChange={(v) => updateData('gastriteIntensidade', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Leve">Leve</SelectItem>
                          <SelectItem value="Moderada">Moderada</SelectItem>
                          <SelectItem value="Intensa">Intensa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Localização</span>
                      <Select value={data.gastriteLocal} onValueChange={(v) => updateData('gastriteLocal', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Antro">Antro</SelectItem>
                          <SelectItem value="Corpo">Corpo</SelectItem>
                          <SelectItem value="Pangastrite">Pangastrite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Atrofia */}
              <div>
                <label className="flex items-center space-x-2 mb-2 p-2 hover:bg-slate-50 rounded -ml-2 cursor-pointer">
                  <Checkbox checked={data.atrofia} onCheckedChange={(v) => updateData('atrofia', v)} />
                  <span className="font-semibold text-sm text-slate-700">Atrofia / Metaplasia</span>
                </label>
                {data.atrofia && (
                  <div className="pl-4 border-l-2 border-slate-200 ml-1 space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 font-bold mb-1 block">Kimura-Takemoto</span>
                      <Select value={data.kimura} onValueChange={(v) => updateData('kimura', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="C-1">C-1</SelectItem>
                          <SelectItem value="C-2">C-2</SelectItem>
                          <SelectItem value="C-3">C-3</SelectItem>
                          <SelectItem value="O-1">O-1</SelectItem>
                          <SelectItem value="O-2">O-2</SelectItem>
                          <SelectItem value="O-3">O-3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={data.metaplasia} onCheckedChange={(v) => updateData('metaplasia', v)} />
                      <span className="text-sm">Metaplasia Intestinal</span>
                    </label>
                    <label className="flex items-center justify-between bg-sky-50 p-2 rounded border border-sky-100 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={data.sydney} onCheckedChange={(v) => updateData('sydney', v)} />
                        <span className="text-xs font-bold text-sky-700">Protocolo Sydney (5 Frascos)</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-sky-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs bg-slate-800 text-white">
                          <p className="font-bold text-sky-300 mb-1">Locais de Biópsia (OLGA/OLGIM)</p>
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            <li>2 no Antro (Peq./Gde. Curvatura)</li>
                            <li>2 no Corpo (Peq./Gde. Curvatura)</li>
                            <li>1 na Incisura Angularis</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                  </div>
                )}
              </div>

              {/* Pólipos */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Nódulos & Pólipos</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox checked={data.polipo} onCheckedChange={(v) => updateData('polipo', v)} />
                    <span className="text-sm font-medium">Pólipo Gástrico</span>
                  </label>
                  {data.polipo && (
                    <div className="p-3 bg-slate-50 rounded border border-slate-100">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <Select value={data.polipoLocal} onValueChange={(v) => updateData('polipoLocal', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Antro">Antro</SelectItem>
                            <SelectItem value="Corpo">Corpo</SelectItem>
                            <SelectItem value="Fundo">Fundo</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={data.polipoParis} onValueChange={(v) => updateData('polipoParis', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-Ip">0-Ip (Pediculado)</SelectItem>
                            <SelectItem value="0-Is">0-Is (Séssil)</SelectItem>
                            <SelectItem value="0-IIa">0-IIa (Elevado/Plano)</SelectItem>
                            <SelectItem value="0-IIb">0-IIb (Plano)</SelectItem>
                            <SelectItem value="0-IIc">0-IIc (Deprimido)</SelectItem>
                            <SelectItem value="0-III">0-III (Escavado)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={data.polipoTam}
                          onChange={(e) => updateData('polipoTam', parseInt(e.target.value) || 0)}
                          className="w-16 p-1 text-sm text-center"
                          placeholder="mm"
                        />
                        <Select value={data.polipoConduta} onValueChange={(v) => updateData('polipoConduta', v)}>
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="biopsia">Biópsia</SelectItem>
                            <SelectItem value="polipectomia">Polipectomia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox checked={data.subepitelial} onCheckedChange={(v) => updateData('subepitelial', v)} />
                    <span className="text-sm">Lesão Subepitelial</span>
                  </label>
                </div>
              </div>

              {/* Outros */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={data.urease} onCheckedChange={(v) => updateData('urease', v)} />
                  <span className="text-sm font-medium">Urease</span>
                </label>
                {data.urease && (
                  <Select value={data.ureaseRes} onValueChange={(v) => updateData('ureaseRes', v)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Negativo">Negativo</SelectItem>
                      <SelectItem value="Positivo">Positivo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={data.xantelasma}
                    onCheckedChange={(v) => updateData('xantelasma', v)}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                  <span className="text-sm text-slate-600">Xantelasma</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={data.gave}
                    onCheckedChange={(v) => updateData('gave', v)}
                    className="data-[state=checked]:bg-red-500"
                  />
                  <span className="text-sm text-slate-600">GAVE</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
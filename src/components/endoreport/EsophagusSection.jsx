import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ESOPHAGITIS_TYPES, getEsophagitisGrouped, ANATOMICAL_TYPES } from '@/utils/esophagitisDb';

export default function EsophagusSection({ isNormal, setIsNormal, data, setData, templates, onApplyTemplate }) {
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
                  {/* Esofagite Unificada */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox 
                        checked={data.esofagite} 
                        onCheckedChange={(v) => {
                          updateData('esofagite', v);
                          if (!v) {
                            updateData('esofagiteId', '');
                            updateData('esofagiteSubclassificacao', '');
                            updateData('eosinofilica', false);
                            updateData('candida', false);
                          } else if (!data.esofagiteId) {
                            updateData('esofagiteId', 'peptica_la_a');
                            updateData('grauEsofagite', 'A');
                          }
                        }} 
                      />
                      <span className="font-bold text-sm text-slate-700">Esofagite</span>
                    </label>
                    
                    {data.esofagite && (
                      <div className="space-y-2 pt-1 border-t border-slate-200">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Tipo de Esofagite</label>
                          <Select 
                            value={data.esofagiteId || 'peptica_la_a'} 
                            onValueChange={(v) => {
                              updateData('esofagiteId', v);
                              updateData('esofagiteSubclassificacao', '');
                              
                              // Sync traditional flags for backward compatibility
                              if (v.startsWith('peptica_la_')) {
                                updateData('grauEsofagite', v.split('_').pop().toUpperCase());
                                updateData('eosinofilica', false);
                                updateData('candida', false);
                              } else if (v === 'imune_eosinofilica') {
                                updateData('eosinofilica', true);
                                updateData('candida', false);
                              } else if (v.startsWith('candida_kodsi_')) {
                                const kodsiRoman = v.split('_').pop() === '1' ? 'I' : v.split('_').pop() === '2' ? 'II' : v.split('_').pop() === '3' ? 'III' : 'IV';
                                updateData('candida', true);
                                updateData('candidaKodsi', kodsiRoman);
                                updateData('eosinofilica', false);
                              } else {
                                updateData('eosinofilica', false);
                                updateData('candida', false);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-[250px]">
                              {Object.entries(getEsophagitisGrouped()).map(([group, options]) => (
                                <div key={group}>
                                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">{group}</div>
                                  {options.map(opt => (
                                    <SelectItem key={opt.id} value={opt.id} className="text-xs">{opt.nome}</SelectItem>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Subclassificações (Zargar / EREFS) */}
                        {(() => {
                          const selected = ESOPHAGITIS_TYPES.find(t => t.id === (data.esofagiteId || 'peptica_la_a'));
                          if (selected?.requerSubclassificacao) {
                            if (selected.escoreSugerido === 'EREFS') {
                              return (
                                <div className="space-y-1">
                                  <label className="text-[10px] text-sky-600 font-semibold uppercase block flex items-center gap-1">
                                    Escore EREFS
                                    <Tooltip>
                                      <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-sky-400" /></TooltipTrigger>
                                      <TooltipContent className="max-w-xs bg-slate-800 text-white p-2 text-xs">
                                        <p className="font-bold mb-1">Escore EREFS (Edema, Rings, Exudate, Furrows, Stricture)</p>
                                        <p>Formato sugerido: Edema (0-2), Anéis (0-3), Exsudato (0-2), Sulcos (0-2), Estenose (0-1).</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </label>
                                  <Input 
                                    placeholder="Ex: E2 R1 E1 F1 S0" 
                                    value={data.esofagiteSubclassificacao || ''}
                                    onChange={(e) => updateData('esofagiteSubclassificacao', e.target.value)}
                                    className="bg-white text-xs h-8"
                                  />
                                </div>
                              );
                            } else if (selected.escoreSugerido === 'Zargar') {
                              return (
                                <div className="space-y-1">
                                  <label className="text-[10px] text-orange-600 font-semibold uppercase block">Grau Zargar</label>
                                  <Select 
                                    value={data.esofagiteSubclassificacao || ''} 
                                    onValueChange={(v) => updateData('esofagiteSubclassificacao', v)}
                                  >
                                    <SelectTrigger className="bg-white text-xs h-8"><SelectValue placeholder="Selecione o Grau" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Grau 0" className="text-xs">Grau 0: Normal</SelectItem>
                                      <SelectItem value="Grau 1" className="text-xs">Grau 1: Edema e hiperemia</SelectItem>
                                      <SelectItem value="Grau 2A" className="text-xs">Grau 2A: Ulcerações superficiais</SelectItem>
                                      <SelectItem value="Grau 2B" className="text-xs">Grau 2B: Ulcerações profundas</SelectItem>
                                      <SelectItem value="Grau 3A" className="text-xs">Grau 3A: Necrose focal</SelectItem>
                                      <SelectItem value="Grau 3B" className="text-xs">Grau 3B: Necrose extensa</SelectItem>
                                      <SelectItem value="Grau 4" className="text-xs">Grau 4: Perfuração</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Marcos Anatômicos / Diafragma */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                    <span className="font-bold text-xs text-slate-500 uppercase tracking-wider block">Transição & Diafragma</span>
                    
                    <div className="space-y-2">
                      <Select 
                        value={data.anatomicoId || 'teg_alinhada'} 
                        onValueChange={(v) => {
                          updateData('anatomicoId', v);
                          if (v === 'teg_alinhada') {
                            updateData('hernia', false);
                            updateData('tamHernia', 40);
                          } else if (v === 'hernia_deslizamento') {
                            updateData('hernia', true);
                            updateData('tamHernia', 3);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white text-xs h-9"><SelectValue placeholder="Estado da Transição" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teg_alinhada" className="text-xs">Transição Esofagogástrica Alinhada</SelectItem>
                          <SelectItem value="hernia_deslizamento" className="text-xs">Hérnia Hiatal por Deslizamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Input de X para Alinhada ou Hérnia */}
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {(data.anatomicoId === 'hernia_deslizamento') ? 'Hérnia (cm)' : 'Prega diafr. (cm)'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={data.tamHernia !== undefined ? data.tamHernia : (data.anatomicoId === 'hernia_deslizamento' ? 3 : 40)}
                          onChange={(e) => updateData('tamHernia', parseInt(e.target.value) || 0)}
                          className="w-16 p-1 text-sm text-center h-8"
                        />
                        <span className="text-xs text-slate-400">cm</span>
                      </div>
                    </div>

                    {/* Hiato Laxo (Sinal do Capuz) */}
                    <label className="flex items-center space-x-2 cursor-pointer pt-1 border-t border-slate-200">
                      <Checkbox 
                        checked={data.hiatoLaxo || false} 
                        onCheckedChange={(v) => updateData('hiatoLaxo', v)} 
                      />
                      <span className="text-xs font-semibold text-slate-600">Hiato Diafragmático Laxo (Sinal do Capuz)</span>
                    </label>
                  </div>
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
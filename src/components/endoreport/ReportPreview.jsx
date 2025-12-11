import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, RotateCcw, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportPreview({
  report,
  wordCount,
  aiMode,
  aiLoading,
  copied,
  onToggleAI,
  onCopy,
  onOpenBiopsy,
  showBiopsyButton
}) {
  return (
    <div className={`bg-white w-full max-w-lg h-full max-h-[85vh] shadow-xl rounded-xl flex flex-col overflow-hidden relative transition-all duration-300 ${aiMode ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}>
      
      {/* Toolbar */}
      <div className="bg-slate-800 text-slate-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 z-10 shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-wide">Laudo Gerado</span>
          {aiMode && (
            <Badge className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 animate-pulse">
              IA ATIVA
            </Badge>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {showBiopsyButton && (
            <Button
              onClick={onOpenBiopsy}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold animate-pulse"
            >
              <Microscope className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Pedido Biópsia</span>
            </Button>
          )}
          <Button
            onClick={onToggleAI}
            size="sm"
            variant={aiMode ? "secondary" : "default"}
            className={aiMode ? "bg-slate-600 hover:bg-slate-500" : "bg-indigo-600 hover:bg-indigo-500"}
          >
            {aiMode ? (
              <>
                <RotateCcw className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Resetar</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Modo IA</span>
              </>
            )}
          </Button>
          <Button
            onClick={onCopy}
            size="sm"
            className={copied ? "bg-slate-700" : "bg-emerald-600 hover:bg-emerald-500"}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Copiar</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Report Text */}
      <Textarea
        value={report}
        readOnly
        className="w-full h-full p-6 text-sm font-mono leading-relaxed text-slate-700 resize-none outline-none border-0 focus:ring-0 focus-visible:ring-0"
        spellCheck={false}
      />

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-2 text-center border-t border-slate-100 flex justify-between items-center">
        <p className="text-[10px] text-slate-400 font-medium">EndoReport Pro v3.3 By OrensteinAI</p>
        <p className="text-[10px] text-slate-400 font-medium">{wordCount} palavras</p>
      </div>

      {/* AI Loading Overlay */}
      {aiLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm"
        >
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-indigo-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
          </div>
          <p className="text-indigo-800 font-bold mt-4 animate-pulse">Otimizando com IA...</p>
          <p className="text-slate-500 text-xs mt-1">Refinando terminologia médica</p>
        </motion.div>
      )}
    </div>
  );
}
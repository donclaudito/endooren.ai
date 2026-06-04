import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, RotateCcw, Microscope, Save, Brain, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/services/apiClient';

export default function ReportPreview({
  report,
  wordCount,
  aiMode,
  aiLoading,
  copied,
  onToggleAI,
  onCopy,
  onOpenBiopsy,
  showBiopsyButton,
  onSaveReport,
  saving,
  hasPatient,
  onReportChange
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    onCopy();
  };

  const handleAnalyzeReport = async () => {
    if (!report || report.trim() === '') return;
    setAnalyzing(true);
    setShowAnalysis(true);
    setAnalysisResult('');
    try {
      const res = await apiClient.post('/api/analyze-report', { report });
      setAnalysisResult(res.analysis);
    } catch (err) {
      setAnalysisResult(`Erro ao analisar laudo: ${err.message || err}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const displayReport = report || '';
  const displayWordCount = displayReport.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className={`bg-white w-full max-w-3xl h-full min-h-[500px] max-h-[90vh] shadow-xl rounded-xl flex flex-col overflow-hidden relative transition-all duration-300 ${aiMode ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}>
      
      {/* Toolbar */}
      <div className="bg-slate-800 text-slate-100 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 z-10 shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-wide">Laudo Gerado</span>
          {aiMode && (
            <Badge className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 animate-pulse">
              IA ATIVA
            </Badge>
          )}
          <Badge className="bg-slate-600 text-slate-200 text-[10px] font-medium px-2 py-0.5">
            EDITÁVEL
          </Badge>
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
            onClick={onSaveReport}
            size="sm"
            disabled={saving || !hasPatient}
            className="bg-green-600 hover:bg-green-700"
            title={!hasPatient ? "Selecione um paciente primeiro" : "Salvar laudo"}
          >
            <Save className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{saving ? 'Salvando...' : 'Salvar'}</span>
          </Button>

          <Button
            onClick={handleAnalyzeReport}
            size="sm"
            disabled={analyzing || !report}
            className="bg-violet-600 hover:bg-violet-500 text-white"
            title="Análise crítica do Dr. Chamsa (IA)"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Brain className="w-4 h-4 mr-1" />
            )}
            <span className="hidden sm:inline">Dr. Chamsa</span>
          </Button>

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
            onClick={handleCopy}
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

      {/* Main Body Layout (Splits between Report and Dr. Chamsa Panel) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        <Textarea
          value={displayReport}
          onChange={(e) => onReportChange(e.target.value)}
          className="flex-1 w-full h-full p-6 text-sm font-mono leading-relaxed text-slate-700 resize-none outline-none border-0 focus:ring-0 focus-visible:ring-0 transition-colors duration-200 bg-white cursor-text"
          spellCheck={false}
        />

        {/* Dr. Chamsa Side Panel */}
        {showAnalysis && (
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-slate-50 flex flex-col min-h-0">
            <div className="p-3 bg-violet-100 border-b border-violet-200 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-violet-800 font-semibold text-xs uppercase tracking-wider">
                <Brain className="w-4 h-4 text-violet-700 animate-pulse" />
                <span>Dr. Chamsa (Parecer)</span>
              </div>
              <button 
                onClick={() => setShowAnalysis(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-1.5 py-0.5 rounded hover:bg-slate-200"
              >
                Fechar
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto text-xs text-slate-700 font-sans leading-relaxed">
              {analyzing ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 gap-3">
                  <div className="w-6 h-6 border-2 border-violet-200 rounded-full relative">
                    <div className="w-6 h-6 border-2 border-violet-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                  </div>
                  <span className="animate-pulse font-medium text-violet-700">Analisando laudo...</span>
                  <span className="text-[10px] text-slate-400 text-center px-4">
                    Avaliando consistência e terminologia científica.
                  </span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-700">
                  {analysisResult ? (
                    <div className="whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200 shadow-sm font-medium">
                      {analysisResult}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-center py-12">
                      Parecer indisponível.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-2 text-center border-t border-slate-100 flex justify-between items-center">
        <p className="text-[10px] text-slate-400 font-medium">EndoReport Pro v3.3 By OrensteinAI</p>
        <p className="text-[10px] text-slate-400 font-medium">{displayWordCount} palavras</p>
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
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Stethoscope, User, Trash2, Sparkles, Copy, Check, RotateCcw, 
  Microscope, Printer, FileText, HelpCircle, Bell, X, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';

import IdentificationSection from '@/components/endoreport/IdentificationSection';
import EsophagusSection from '@/components/endoreport/EsophagusSection';
import StomachSection from '@/components/endoreport/StomachSection';
import DuodenumSection from '@/components/endoreport/DuodenumSection';
import ReportPreview from '@/components/endoreport/ReportPreview';
import BiopsyModal from '@/components/endoreport/BiopsyModal';

export default function EndoReport() {
  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await base44.entities.Settings.list();
      if (result && result.length > 0) {
        return result[0];
      }
      return null;
    }
  });

  const doctorName = settings?.doctor_name || 'Dr(a). Endoscopista';
  const doctorCrm = settings?.doctor_crm || 'CRM 000000';
  const customIndications = settings?.custom_indications || [];

  // Identification
  const [paciente, setPaciente] = useState('');
  const [indicacao, setIndicacao] = useState('Dispepsia');
  const [preparoInadequado, setPreparoInadequado] = useState(false);

  // Esophagus
  const [esoNormal, setEsoNormal] = useState(true);
  const [esoData, setEsoData] = useState({
    neoplasia: false,
    neoTipo: 'vegetante',
    neoLocal: 'terço distal',
    neoEstenose: false,
    esofagite: false,
    grauEsofagite: 'A',
    hernia: false,
    tamHernia: 3,
    varizes: false,
    varizesCalibre: 'fino',
    varizesRedSpots: false,
    barrett: false,
    barrettC: 0,
    barrettM: 0,
    eosinofilica: false,
    candida: false,
    candidaKodsi: 'I',
    estenose: false,
    ulcera: false,
    diverticulo: false,
    malloryWeiss: false
  });

  // Stomach
  const [estoNormal, setEstoNormal] = useState(true);
  const [estoData, setEstoData] = useState({
    neoplasia: false,
    neoBorrmann: 'I',
    neoLocal: 'Antro',
    gastriteTipo: 'Enantematosa',
    gastriteIntensidade: 'Leve',
    gastriteLocal: 'Antro',
    atrofia: false,
    kimura: 'C-1',
    metaplasia: false,
    sydney: false,
    polipo: false,
    polipoLocal: 'Antro',
    polipoParis: '0-Ip',
    polipoTam: 4,
    polipoConduta: 'biopsia',
    subepitelial: false,
    urease: false,
    ureaseRes: 'Negativo',
    xantelasma: false,
    gave: false
  });

  // Duodenum
  const [duoNormal, setDuoNormal] = useState(true);
  const [duoData, setDuoData] = useState({
    duodenite: false,
    ulcera: false,
    celiaca: false,
    celAtrofia: false,
    celMosaico: false,
    celSerrilhado: false,
    diverticulo: false
  });

  // UI State
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [biopsyModalOpen, setBiopsyModalOpen] = useState(false);
  const [report, setReport] = useState('');

  const checkBiopsyNeeded = useCallback(() => {
    return esoData.barrett || esoData.eosinofilica || esoData.neoplasia ||
           estoData.neoplasia || estoData.sydney || duoData.celiaca || estoData.polipo;
  }, [esoData, estoData, duoData]);

  const generateReport = useCallback(() => {
    let text = "";
    
    // Header
    if (paciente) text += `PACIENTE: ${paciente.toUpperCase()}\n`;
    text += `INDICAÇÃO: ${indicacao}\n`;
    text += `PREPARO: ${preparoInadequado ? "Inadequado." : "Jejum adequado (6-8h)."}\n`;
    text += `SEDAÇÃO: Realizada com boa tolerância.\n\n`;
    text += `DESCRIÇÃO DOS ACHADOS\n=====================\n\n`;

    let conclusao = [];
    let obs = [];

    if (preparoInadequado) {
      obs.push("Preparo inadequado, limitando a avaliação completa de algumas áreas.");
    }

    // ESÔFAGO
    text += `ESÔFAGO:\n`;
    if (esoNormal) {
      text += aiMode ? 
        `Introdução do aparelho sob visão direta. Esôfago de calibre, distensibilidade e trajeto anatômicos preservados. Mucosa de coloração rósea, brilho e relevo habituais, livre de lesões focais ou difusas. Transição esofagogástrica coincidente com o pinçamento diafragmático.\n` :
        `Calibre e distensibilidade preservados. Mucosa de aspecto normal, sem lesões. Transição esofagogástrica coincidente com o pinçamento diafragmático.\n`;
    } else {
      let e_txt = aiMode ? "Esôfago com calibre e distensibilidade preservados (salvo se descrito abaixo). " : "Calibre preservado. ";
      
      if (esoData.neoplasia) {
        if (aiMode) {
          e_txt += `\nIdentifica-se lesão tumoral de crescimento ${esoData.neoTipo}, localizada em ${esoData.neoLocal}, de consistência endurecida e friável ao toque do aparelho. A lesão ocupa mais de 50% da circunferência do órgão${esoData.neoEstenose ? " e determina estenose do lúmen, dificultando a progressão do aparelho" : ", sem determinar estenose significativa"}. `;
        } else {
          e_txt += `\nLesão neoplásica ${esoData.neoTipo} em ${esoData.neoLocal}. ${esoData.neoEstenose ? "Causa estenose." : "Sem estenose."} `;
        }
        conclusao.push(`Tumor de Esôfago em ${esoData.neoLocal} (Suspeita de Neoplasia)`);
        obs.push("Realizadas biópsias da lesão esofágica.");
      }

      if (esoData.esofagite) {
        const grau = esoData.grauEsofagite;
        let desc = (grau === 'A' || grau === 'B') ? "erosões não confluentes" : "erosões confluentes";
        if (aiMode) {
          e_txt += `Observam-se soluções de continuidade na mucosa (erosões) ${desc} no terço distal, compatíveis com Esofagite de Refluxo (Classificação de Los Angeles grau ${grau}). `;
        } else {
          e_txt += `Presença de ${desc} na mucosa distal, compatível com Esofagite Los Angeles ${grau}. `;
        }
        conclusao.push(`Esofagite de Refluxo (Los Angeles ${grau})`);
      }

      if (esoData.hernia) {
        if (aiMode) {
          e_txt += `Transição esofagogástrica (Linha Z) elevada cerca de ${esoData.tamHernia}cm em relação ao pinçamento diafragmático, caracterizando Hérnia Hiatal por deslizamento. `;
        } else {
          e_txt += `Linha Z elevada cerca de ${esoData.tamHernia}cm acima do pinçamento diafragmático. `;
        }
        conclusao.push(`Hérnia Hiatal por deslizamento (${esoData.tamHernia}cm)`);
      }

      if (esoData.varizes) {
        let cal_txt = esoData.varizesCalibre === 'fino' ? "fino calibre" : (esoData.varizesCalibre === 'medio' ? "médio calibre" : "grosso calibre");
        if (aiMode) {
          e_txt += `\nIdentificam-se cordões varicosos de ${cal_txt} no terço distal/médio do esôfago, que ${esoData.varizesCalibre === 'fino' ? "desaparecem" : "não desaparecem totalmente"} à insuflação. ${esoData.varizesRedSpots ? "Presença de sinais vermelhos (red spots)." : "Ausência de sinais vermelhos."} `;
        } else {
          e_txt += `\nPresença de varizes esofágicas de ${cal_txt}. ${esoData.varizesRedSpots ? "Com sinais vermelhos." : "Sem sinais de sangramento recente."} `;
        }
        let conc_var = `Varizes Esofágicas de ${cal_txt}`;
        if (esoData.varizesRedSpots) conc_var += " com sinais de alto risco";
        conclusao.push(conc_var);
      }

      if (esoData.barrett) {
        if (aiMode) {
          e_txt += `\nNota-se projeção de mucosa de aspecto colunar (vermelho-salmão) estendendo-se proximalmente à junção esofagogástrica. Classificação de Praga: C${esoData.barrettC}M${esoData.barrettM}. `;
        } else {
          e_txt += `\nLinguetas de mucosa rosa-salmão em esôfago distal. Critérios de Praga: C${esoData.barrettC}M${esoData.barrettM}. `;
        }
        conclusao.push(`Suspeita de Esôfago de Barrett (Praga C${esoData.barrettC}M${esoData.barrettM})`);
        obs.push("Biópsias realizadas em protocolo de Seattle para confirmação histológica de Barrett.");
      }

      if (esoData.eosinofilica) {
        e_txt += aiMode ? "\nPresença de anéis concêntricos (traquealização) e sulcos longitudinais na mucosa esofágica. " : "\nTraquealização e sulcos longitudinais. ";
        conclusao.push("Suspeita de Esofagite Eosinofílica");
        obs.push("Realizadas biópsias seriadas de esôfago (proximal/distal) para contagem de eosinófilos.");
      }

      if (esoData.candida) {
        e_txt += `\nPresença de placas esbranquiçadas aderidas à mucosa (Kodsi ${esoData.candidaKodsi}). `;
        conclusao.push(`Candidíase Esofágica (Kodsi ${esoData.candidaKodsi})`);
      }

      if (esoData.diverticulo) {
        e_txt += "\nSacularidade diverticular de boca larga observada em parede esofágica. ";
        conclusao.push("Divertículo Esofágico");
      }

      if (esoData.malloryWeiss) {
        e_txt += "\nLaceração longitudinal na mucosa da transição esofagogástrica com fundo de fibrina. ";
        conclusao.push("Laceração de Mallory-Weiss");
      }

      if (esoData.estenose) {
        e_txt += `\nRedução do calibre luminal (estenose). `;
        conclusao.push(`Estenose Esofágica`);
      }

      if (esoData.ulcera) {
        e_txt += "\nÚlcera em mucosa esofágica. ";
        conclusao.push("Úlcera Esofágica");
      }

      text += e_txt + "\n";
    }

    // ESTÔMAGO
    text += `\nESTÔMAGO:\n`;
    if (estoNormal) {
      text += aiMode ? 
        `Estômago com boa expansibilidade à insuflação. Lago mucoso claro e em quantidade habitual. Mucosa de fundo, corpo e antro com aspecto íntegro. Manobra de retrovisão sem alterações. Piloro centrado.\n` :
        `Lago mucoso claro. Fundo, corpo e antro com mucosa íntegra. Retrovisão sem alterações. Piloro permeável.\n`;
    } else {
      let s_txt = aiMode ? "Lago mucoso de aspecto habitual. " : "Lago mucoso claro. ";

      if (estoData.neoplasia) {
        if (aiMode) {
          s_txt += `\nIdentificada lesão neoplásica avançada em ${estoData.neoLocal}, caracterizada por processo infiltrativo e ulcerado, com bordas irregulares e elevadas, friável ao toque. Classificação macroscópica de Borrmann ${estoData.neoBorrmann}. `;
        } else {
          s_txt += `\nLesão tumoral Borrmann ${estoData.neoBorrmann} em ${estoData.neoLocal}. `;
        }
        conclusao.push(`Neoplasia Gástrica Avançada (Borrmann ${estoData.neoBorrmann}) de ${estoData.neoLocal}`);
        obs.push("Realizadas múltiplas biópsias da lesão gástrica.");
      }

      if (!estoData.atrofia || (estoData.atrofia && estoData.gastriteTipo !== 'Enantematosa')) {
        if (aiMode) {
          s_txt += `Mucosa de ${estoData.gastriteLocal} exibindo hiperemia difusa de padrão ${estoData.gastriteTipo.toLowerCase()}, de intensidade ${estoData.gastriteIntensidade.toLowerCase()}. `;
        } else {
          s_txt += `Mucosa de ${estoData.gastriteLocal} apresentando hiperemia ${estoData.gastriteIntensidade.toLowerCase()} (${estoData.gastriteTipo.toLowerCase()}). `;
        }
        conclusao.push(`Gastrite ${estoData.gastriteTipo} ${estoData.gastriteIntensidade} de ${estoData.gastriteLocal}`);
      }

      if (estoData.atrofia) {
        s_txt += `Mucosa adelgaçada, pálida, com visualização da trama vascular (Kimura ${estoData.kimura}). `;
        conclusao.push(`Gastrite Atrófica (Kimura-Takemoto ${estoData.kimura})`);

        if (estoData.metaplasia) {
          s_txt += "Áreas de metaplasia intestinal visíveis. ";
          conclusao.push("Metaplasia Intestinal Gástrica");
        }
        if (estoData.sydney) {
          obs.push("Realizadas biópsias gástricas (Protocolo de Sydney) para estadiamento OLGA/OLGIM.");
        }
      }

      if (estoData.polipo) {
        s_txt += `\nLesão elevada em ${estoData.polipoLocal}, ${estoData.polipoTam}mm, Classificação de Paris ${estoData.polipoParis}. Realizada ${estoData.polipoConduta}. `;
        let conduta_nome = estoData.polipoConduta === 'biopsia' ? "biopsiado" : "ressecado";
        conclusao.push(`Pólipo gástrico de ${estoData.polipoLocal} ${conduta_nome} (Paris ${estoData.polipoParis})`);
      }

      if (estoData.subepitelial) {
        s_txt += aiMode ? "\nAbaulamento da parede gástrica recoberto por mucosa íntegra e de coloração normal (lesão subepitelial). Sinal da tenda positivo. " : "\nLesão subepitelial com mucosa íntegra. ";
        conclusao.push("Lesão subepitelial gástrica (Sugestiva de Lipoma/GIST/Leiomioma)");
      }

      if (estoData.xantelasma) {
        s_txt += "\nPlacas amareladas planas, levemente elevadas na mucosa gástrica. ";
        conclusao.push("Xantelasma Gástrico");
      }

      if (estoData.gave) {
        s_txt += "\nEstrias vasculares avermelhadas longitudinais convergindo para o piloro (aspecto de estômago em melancia). ";
        conclusao.push("Ectasia Vascular Antral Gástrica (GAVE)");
        if (aiMode) obs.push("Sugerido tratamento com Plasma de Argônio se houver anemia associada.");
      }

      if (estoData.urease) {
        s_txt += `\nTeste de urease: ${estoData.ureaseRes}.`;
        conclusao.push(`Teste de Urease: ${estoData.ureaseRes}`);
      }

      s_txt += aiMode ? " Manobra de retrovisão realizada com sucesso." : " Manobra de retrovisão realizada.";
      text += s_txt + "\n";
    }

    // DUODENO
    text += `\nDUODENO:\n`;
    if (duoNormal) {
      text += aiMode ? 
        `Bulbo duodenal amplo. Segunda porção duodenal com pregueado de Kerckring preservado e papila de aspecto macroscópico habitual.\n` :
        `Bulbo e segunda porção sem alterações.\n`;
    } else {
      let d_txt = "";
      if (duoData.duodenite) {
        d_txt += "Mucosa do bulbo enantematosa (Duodenite). ";
        conclusao.push("Duodenite Erosiva");
      }
      if (duoData.ulcera) {
        d_txt += "Lesão ulcerada em bulbo duodenal. ";
        conclusao.push("Úlcera Bulbar");
      }

      if (duoData.celiaca) {
        let achadosCel = [];
        if (duoData.celAtrofia) achadosCel.push("atrofia de vilosidades");
        if (duoData.celMosaico) achadosCel.push("aspecto em mosaico");
        if (duoData.celSerrilhado) achadosCel.push("serrilhado de pregas");
        
        let descCel = achadosCel.length > 0 ? achadosCel.join(", ") : (aiMode ? "redução do pregueado, serrilhado e mosaico" : "sinais de atrofia vilositária");
        
        d_txt += aiMode ? `\nSegunda porção duodenal apresentando ${descCel}. ` : `\nPresença de ${descCel} na segunda porção duodenal. `;
        
        conclusao.push("Sinais endoscópicos sugestivos de atrofia vilositária (Suspeita de Doença Celíaca)");
        obs.push("Realizadas biópsias de segunda porção duodenal para investigação de enteropatia.");
      }

      if (duoData.diverticulo) {
        d_txt += "\nDivertículo de boca larga na segunda porção duodenal (periampular). ";
        conclusao.push("Divertículo Duodenal Periampular");
      }

      if (d_txt === "") d_txt = "Bulbo e segunda porção anatômicos.";
      text += d_txt + "\n";
    }

    // CONCLUSÃO
    text += `\n----------------------------------\n`;
    text += `CONCLUSÃO:\n`;
    if (conclusao.length === 0) text += "1. Exame dentro dos padrões da normalidade.";
    else {
      conclusao.forEach((c, i) => text += `${i + 1}. ${c}\n`);
    }

    if (obs.length > 0) {
      text += `\nCONDUTA / OBS:\n`;
      obs.forEach(o => text += `* ${o}\n`);
    }

    text += `\n\nAssinado eletronicamente por:\n${doctorName} - ${doctorCrm}`;

    setReport(text);
  }, [paciente, indicacao, preparoInadequado, esoNormal, esoData, estoNormal, estoData, duoNormal, duoData, aiMode, doctorName, doctorCrm]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const handleToggleAI = () => {
    if (!aiMode) {
      setAiLoading(true);
      setTimeout(() => {
        setAiMode(true);
        setAiLoading(false);
      }, 800);
    } else {
      setAiMode(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Deseja iniciar um novo laudo? Todos os dados serão apagados.")) {
      setPaciente('');
      setIndicacao('Dispepsia');
      setPreparoInadequado(false);
      setEsoNormal(true);
      setEsoData({
        neoplasia: false, neoTipo: 'vegetante', neoLocal: 'terço distal', neoEstenose: false,
        esofagite: false, grauEsofagite: 'A', hernia: false, tamHernia: 3,
        varizes: false, varizesCalibre: 'fino', varizesRedSpots: false,
        barrett: false, barrettC: 0, barrettM: 0, eosinofilica: false,
        candida: false, candidaKodsi: 'I', estenose: false, ulcera: false,
        diverticulo: false, malloryWeiss: false
      });
      setEstoNormal(true);
      setEstoData({
        neoplasia: false, neoBorrmann: 'I', neoLocal: 'Antro',
        gastriteTipo: 'Enantematosa', gastriteIntensidade: 'Leve', gastriteLocal: 'Antro',
        atrofia: false, kimura: 'C-1', metaplasia: false, sydney: false,
        polipo: false, polipoLocal: 'Antro', polipoParis: '0-Ip', polipoTam: 4, polipoConduta: 'biopsia',
        subepitelial: false, urease: false, ureaseRes: 'Negativo', xantelasma: false, gave: false
      });
      setDuoNormal(true);
      setDuoData({
        duodenite: false, ulcera: false, celiaca: false,
        celAtrofia: false, celMosaico: false, celSerrilhado: false, diverticulo: false
      });
      setAiMode(false);
    }
  };

  const wordCount = report.trim().split(/\s+/).length;

  return (
    <TooltipProvider>
      <div className="flex flex-col lg:flex-row h-screen bg-slate-50 text-slate-700">
        {/* LEFT PANEL - FORM */}
        <div className="w-full lg:w-7/12 h-full overflow-y-auto border-r border-slate-200">
          <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                  <FileText className="w-7 h-7 text-sky-600" />
                  EndoReport
                </h1>
                <p className="text-sm text-slate-500 font-medium ml-1 mt-1">EndoReport Pro v3.3 By OrensteinAI</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to={createPageUrl('Settings')}>
                  <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-700">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Configurações</span>
                  </Button>
                </Link>
                <button 
                  onClick={handleReset}
                  className="text-slate-500 hover:text-red-600 font-medium text-xs flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Novo Laudo</span>
                </button>
                <Badge className="bg-sky-100 text-sky-800 border border-sky-200 font-bold">PRO</Badge>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <IdentificationSection
                paciente={paciente}
                setPaciente={setPaciente}
                indicacao={indicacao}
                setIndicacao={setIndicacao}
                customIndications={customIndications}
              />

              {/* Preparo Note */}
              <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-700 tracking-tight flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-500" />
                  Notas do Procedimento
                </h3>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={preparoInadequado}
                    onCheckedChange={setPreparoInadequado}
                    className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                  />
                  <span className="text-sm font-medium text-red-600">Preparo Inadequado</span>
                </label>
              </div>

              <EsophagusSection
                isNormal={esoNormal}
                setIsNormal={setEsoNormal}
                data={esoData}
                setData={setEsoData}
              />

              <StomachSection
                isNormal={estoNormal}
                setIsNormal={setEstoNormal}
                data={estoData}
                setData={setEstoData}
              />

              <DuodenumSection
                isNormal={duoNormal}
                setIsNormal={setDuoNormal}
                data={duoData}
                setData={setDuoData}
              />

              <div className="h-24" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div className="w-full lg:w-5/12 h-full bg-slate-100 p-4 lg:p-6 flex flex-col items-center justify-center border-l border-slate-200">
          <ReportPreview
            report={report}
            wordCount={wordCount}
            aiMode={aiMode}
            aiLoading={aiLoading}
            copied={copied}
            onToggleAI={handleToggleAI}
            onCopy={handleCopy}
            onOpenBiopsy={() => setBiopsyModalOpen(true)}
            showBiopsyButton={checkBiopsyNeeded()}
          />
        </div>

        <BiopsyModal
          open={biopsyModalOpen}
          onClose={() => setBiopsyModalOpen(false)}
          paciente={paciente}
          doctorName={`${doctorName} - ${doctorCrm}`}
          esoData={esoData}
          estoData={estoData}
          duoData={duoData}
        />
      </div>
    </TooltipProvider>
  );
}
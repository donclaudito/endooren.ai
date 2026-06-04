import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Microscope, Printer, FileText, HelpCircle, Bell, X, Settings, Users, LogOut, Hammer } from
'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

import IdentificationSection from '@/components/endoreport/IdentificationSection';
import EsophagusSection from '@/components/endoreport/EsophagusSection';
import StomachSection from '@/components/endoreport/StomachSection';
import DuodenumSection from '@/components/endoreport/DuodenumSection';
import ConclusionTemplates from '@/components/endoreport/ConclusionTemplates';
import ProceduresSection from '@/components/endoreport/ProceduresSection';
import ReportPreview from '@/components/endoreport/ReportPreview';
import BiopsyModal from '@/components/endoreport/BiopsyModal';
import PatientSelector from '@/components/endoreport/PatientSelector';
import { getEsophagitisReport, getAnatomicalReport } from '@/utils/esophagitisDb';
import { PROCEDURES, generateProcedureText } from '@/utils/proceduresDb';

export default function EndoReport() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientIdFromUrl = urlParams.get('patient_id');

  const { logout } = useAuth();

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiClient.get('/api/settings')
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => apiClient.get('/api/templates')
  });

  const doctorName = settings?.doctor_name || 'Dr(a). Endoscopista';
  const doctorCrm = settings?.doctor_crm || 'CRM 000000';
  const customIndications = settings?.custom_indications || [];

  // Patient Management
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch patient if ID in URL
  const { data: patientFromUrl } = useQuery({
    queryKey: ['patient-from-url', patientIdFromUrl],
    queryFn: () => apiClient.get(`/api/patients?id=${patientIdFromUrl}`),
    enabled: !!patientIdFromUrl
  });

  useEffect(() => {
    if (patientFromUrl && !selectedPatient) {
      setSelectedPatient(patientFromUrl);
      setPaciente(patientFromUrl.name);
    }
  }, [patientFromUrl]);

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
    anatomicoId: 'teg_alinhada',
    tamHernia: 40,
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
    gastrite: false,
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
  const [saving, setSaving] = useState(false);
  // Conclusion templates added as extra items
  const [conclusionTemplates, setConclusionTemplates] = useState([]);
  // Procedures performed during the exam
  const [proceduresData, setProceduresData] = useState({});

  const queryClient = useQueryClient();

  const saveReportMutation = useMutation({
    mutationFn: (data) => apiClient.post('/api/exames', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patient-reports']);
      setSaving(false);
      alert('Laudo salvo com sucesso!');
    }
  });

  const checkBiopsyNeeded = useCallback(() => {
    return esoData.barrett || esoData.eosinofilica || esoData.neoplasia ||
    estoData.neoplasia || estoData.sydney || duoData.celiaca || estoData.polipo;
  }, [esoData, estoData, duoData]);

  const parseReportSections = (text) => {
    const sections = {
      header: '',
      esophagus: '',
      stomach: '',
      duodenum: '',
      procedures: '',
      conclusion: '',
      obs: '',
      signature: ''
    };

    if (!text) return sections;
    const normalized = text.replace(/\r\n/g, '\n');

    const esoIdx = normalized.indexOf('ESÔFAGO:\n');
    const estoIdx = normalized.indexOf('ESTÔMAGO:\n');
    const duoIdx = normalized.indexOf('DUODENO:\n');
    const procIdx = normalized.indexOf('PROCEDIMENTOS REALIZADOS:\n');
    const conclIdx = normalized.indexOf('----------------------------------\nCONCLUSÃO:\n');
    const obsIdx = normalized.indexOf('CONDUTA / OBS:\n');
    const sigIdx = normalized.indexOf('Assinado eletronicamente por:\n');

    if (esoIdx !== -1) {
      sections.header = normalized.substring(0, esoIdx).trim();
      const esoEnd = estoIdx !== -1 ? estoIdx : normalized.length;
      sections.esophagus = normalized.substring(esoIdx + 'ESÔFAGO:\n'.length, esoEnd).trim();
    } else {
      sections.header = normalized.trim();
    }

    if (estoIdx !== -1) {
      const estoEnd = duoIdx !== -1 ? duoIdx : normalized.length;
      sections.stomach = normalized.substring(estoIdx + 'ESTÔMAGO:\n'.length, estoEnd).trim();
    }

    if (duoIdx !== -1) {
      const duoEnd = procIdx !== -1 ? procIdx : conclIdx !== -1 ? conclIdx : normalized.length;
      sections.duodenum = normalized.substring(duoIdx + 'DUODENO:\n'.length, duoEnd).trim();
    }

    if (procIdx !== -1) {
      const procEnd = conclIdx !== -1 ? conclIdx : normalized.length;
      sections.procedures = normalized.substring(procIdx + 'PROCEDIMENTOS REALIZADOS:\n'.length, procEnd).trim();
    }

    if (conclIdx !== -1) {
      const conclEnd = obsIdx !== -1 ? obsIdx : sigIdx !== -1 ? sigIdx : normalized.length;
      sections.conclusion = normalized.substring(conclIdx + '----------------------------------\nCONCLUSÃO:\n'.length, conclEnd).trim();
    }

    if (obsIdx !== -1) {
      const obsEnd = sigIdx !== -1 ? sigIdx : normalized.length;
      sections.obs = normalized.substring(obsIdx + 'CONDUTA / OBS:\n'.length, obsEnd).trim();
    }

    if (sigIdx !== -1) {
      sections.signature = normalized.substring(sigIdx).trim();
    }

    return sections;
  };

  const buildReportFromSections = (sections) => {
    let text = (sections.header || '').trim() + '\n\n';
    
    text += `ESÔFAGO:\n${sections.esophagus || ''}\n\n`;
    text += `ESTÔMAGO:\n${sections.stomach || ''}\n\n`;
    text += `DUODENO:\n${sections.duodenum || ''}\n\n`;
    
    if (sections.procedures) {
      text += `PROCEDIMENTOS REALIZADOS:\n${sections.procedures}\n\n`;
    }

    text += `----------------------------------\n`;
    text += `CONCLUSÃO:\n${sections.conclusion || ''}\n`;
    
    if (sections.obs) {
      text += `\nCONDUTA / OBS:\n${sections.obs}\n`;
    }
    
    if (sections.signature) {
      text += `\n\n${sections.signature}`;
    }
    
    return text;
  };

  const generateProceduresText = () => {
    const lines = [];
    PROCEDURES.forEach(proc => {
      const state = proceduresData[proc.id];
      if (!state?.selected) return;
      const text = generateProcedureText(proc, state);
      if (text) lines.push(`- ${text}`);
    });
    return lines.join('\n');
  };

  const generateHeaderText = () => {
    let text = "";
    if (paciente) text += `PACIENTE: ${paciente.toUpperCase()}\n`;
    text += `INDICAÇÃO: ${indicacao}\n`;
    text += `PREPARO: ${preparoInadequado ? "Inadequado." : "Jejum adequado (6-8h)."}\n`;
    text += `SEDAÇÃO: Realizada com boa tolerância.\n`;
    return text.trim();
  };

  const generateEsophagusText = () => {
    let e_txt = "";
    if (esoNormal) {
      e_txt = aiMode ?
      `Introdução do aparelho sob visão direta. Esôfago de calibre, distensibilidade e trajeto anatômicos preservados. Mucosa de coloração rósea, brilho e relevo habituais, livre de lesões focais ou difusas. Transição esofagogástrica coincidente com o pinçamento diafragmático.` :
      `Calibre e distensibilidade preservados. Mucosa de aspecto normal, sem lesões. Transição esofagogástrica coincidente com o pinçamento diafragmático.`;
    } else {
      e_txt = aiMode ? "Esôfago com calibre e distensibilidade preservados (salvo se descrito abaixo). " : "Calibre preservado. ";

      if (esoData.neoplasia) {
        if (aiMode) {
          e_txt += `\nIdentifica-se lesão tumoral de crescimento ${esoData.neoTipo}, localizada em ${esoData.neoLocal}, de consistência endurecida e friável ao toque do aparelho. A lesão ocupa mais de 50% da circunferência do órgão${esoData.neoEstenose ? " e determina estenose do lúmen, dificultando a progressão do aparelho" : ", sem determinar estenose significativa"}. `;
        } else {
          e_txt += `\nLesão neoplásica ${esoData.neoTipo} em ${esoData.neoLocal}. ${esoData.neoEstenose ? "Causa estenose." : "Sem estenose."} `;
        }
      }

      if (esoData.esofagite) {
        if (esoData.esofagiteId) {
          const report = getEsophagitisReport(esoData.esofagiteId, esoData.esofagiteSubclassificacao, aiMode);
          if (report) {
            e_txt += `\n${report.text} `;
          }
        } else {
          const grau = esoData.grauEsofagite;
          let desc = grau === 'A' || grau === 'B' ? "erosões não confluentes" : "erosões confluentes";
          if (aiMode) {
            e_txt += `Observam-se soluções de continuidade na mucosa (erosões) ${desc} no terço distal, compatíveis com Esofagite de Refluxo (Classificação de Los Angeles grau ${grau}). `;
          } else {
            e_txt += `Presença de ${desc} na mucosa distal, compatível com Esofagite Los Angeles ${grau}. `;
          }
        }
      }

      if (esoData.anatomicoId) {
        const report = getAnatomicalReport(esoData.anatomicoId, esoData.tamHernia);
        if (report) {
          e_txt += `\n${report.text} `;
        }
      } else {
        if (esoData.hernia) {
          if (aiMode) {
            e_txt += `\nJunção esofagogástrica (topo das pregas gástricas) visualizada acima do pinçamento diafragmático, determinando deslocamento cranial do estômago proximal de cerca de ${esoData.tamHernia || 3} cm. Presença de câmara herniária. `;
          } else {
            e_txt += `\nLinha Z elevada cerca de ${esoData.tamHernia || 3}cm acima do pinçamento diafragmático. `;
          }
        } else {
          const dist = esoData.tamHernia !== undefined ? esoData.tamHernia : 40;
          e_txt += `\nLinha Z e junção esofagogástrica (topo das pregas gástricas) situadas no mesmo nível do pinçamento diafragmático, a ${dist} cm dos incisivos superiores. Transição epitelial nítida e sinuosa. `;
        }
      }

      if (esoData.hiatoLaxo) {
        const report = getAnatomicalReport('pinçamento_laxo');
        if (report) {
          e_txt += `\n${report.text} `;
        }
      }

      if (esoData.varizes) {
        let cal_txt = esoData.varizesCalibre === 'fino' ? "fino calibre" : esoData.varizesCalibre === 'medio' ? "médio calibre" : "grosso calibre";
        if (aiMode) {
          e_txt += `\nIdentificam-se cordões varicosos de ${cal_txt} no terço distal/médio do esôfago, que ${esoData.varizesCalibre === 'fino' ? "desaparecem" : "não desaparecem totalmente"} à insuflação. ${esoData.varizesRedSpots ? "Presença de sinais vermelhos (red spots)." : "Ausência de sinais vermelhos."} `;
        } else {
          e_txt += `\nPresença de varizes esofágicas de ${cal_txt}. ${esoData.varizesRedSpots ? "Com sinais vermelhos." : "Sem sinais de sangramento recente."} `;
        }
      }

      if (esoData.barrett) {
        if (aiMode) {
          e_txt += `\nNota-se projeção de mucosa de aspecto colunar (vermelho-salmão) estendendo-se proximalmente à junção esofagogástrica. Classificação de Praga: C${esoData.barrettC}M${esoData.barrettM}. `;
        } else {
          e_txt += `\nLinguetas de mucosa rosa-salmão em esôfago distal. Critérios de Praga: C${esoData.barrettC}M${esoData.barrettM}. `;
        }
      }

      if (esoData.eosinofilica && !esoData.esofagiteId) {
        e_txt += aiMode ? "\nPresença de anéis concêntricos (traquealização) e sulcos longitudinais na mucosa esofágica. " : "\nTraquealização e sulcos longitudinais. ";
      }

      if (esoData.candida && !esoData.esofagiteId) {
        e_txt += `\nPresença de placas esbranquiçadas aderidas à mucosa (Kodsi ${esoData.candidaKodsi}). `;
      }

      if (esoData.diverticulo) {
        e_txt += "\nSacularidade diverticular de boca larga observada em parede esofágica. ";
      }

      if (esoData.malloryWeiss) {
        e_txt += "\nLaceração longitudinal na mucosa da transição esofagogástrica com fundo de fibrina. ";
      }

      if (esoData.estenose) {
        e_txt += `\nRedução do calibre luminal (estenose). `;
      }

      if (esoData.ulcera) {
        e_txt += "\nÚlcera em mucosa esofágica. ";
      }
    }
    return e_txt.trim();
  };

  const generateStomachText = () => {
    let s_txt = "";
    if (estoNormal) {
      s_txt = aiMode ?
      `Estômago com boa expansibilidade à insuflação. Lago mucoso claro e em quantidade habitual. Mucosa de fundo, corpo e antro com aspecto íntegro. Manobra de retrovisão sem alterações. Piloro centrado.` :
      `Lago mucoso claro. Fundo, corpo e antro com mucosa íntegra. Retrovisão sem alterações. Piloro permeável.`;
    } else {
      s_txt = aiMode ? "Lago mucoso de aspecto habitual. " : "Lago mucoso claro. ";

      if (estoData.neoplasia) {
        if (aiMode) {
          s_txt += `\nIdentificada lesão neoplásica avançada em ${estoData.neoLocal}, caracterizada por processo infiltrativo e ulcerado, com bordas irregulares e elevadas, friável ao toque. Classificação macroscópica de Borrmann ${estoData.neoBorrmann}. `;
        } else {
          s_txt += `\nLesão tumoral Borrmann ${estoData.neoBorrmann} em ${estoData.neoLocal}. `;
        }
      }

      if (estoData.gastrite && (!estoData.atrofia || estoData.gastriteTipo !== 'Enantematosa')) {
        if (aiMode) {
          s_txt += `Mucosa de ${estoData.gastriteLocal} exibindo hiperemia difusa de padrão ${estoData.gastriteTipo.toLowerCase()}, de intensidade ${estoData.gastriteIntensidade.toLowerCase()}. `;
        } else {
          s_txt += `Mucosa de ${estoData.gastriteLocal} apresentando hiperemia ${estoData.gastriteIntensidade.toLowerCase()} (${estoData.gastriteTipo.toLowerCase()}). `;
        }
      }

      if (estoData.atrofia) {
        s_txt += `Mucosa adelgaçada, pálida, com visualização da trama vascular (Kimura ${estoData.kimura}). `;
        if (estoData.metaplasia) {
          s_txt += "Áreas de metaplasia intestinal visíveis. ";
        }
      }

      if (estoData.polipo) {
        s_txt += `\nLesão elevada em ${estoData.polipoLocal}, ${estoData.polipoTam}mm, Classificação de Paris ${estoData.polipoParis}. Realizada ${estoData.polipoConduta}. `;
      }

      if (estoData.subepitelial) {
        s_txt += aiMode ? "\nAbaulamento da parede gástrica recoberto por mucosa íntegra e de coloração normal (lesão subepitelial). Sinal da tenda positivo. " : "\nLesão subepitelial com mucosa íntegra. ";
      }

      if (estoData.xantelasma) {
        s_txt += "\nPlacas amareladas planas, levemente elevadas na mucosa gástrica. ";
      }

      if (estoData.gave) {
        s_txt += "\nEstrias vasculares avermelhadas longitudinais convergindo para o piloro (aspecto de estômago em melancia). ";
      }

      if (estoData.urease) {
        s_txt += `\nTeste de urease: ${estoData.ureaseRes}.`;
      }

      s_txt += aiMode ? " Manobra de retrovisão realizada com sucesso." : " Manobra de retrovisão realizada.";
    }
    return s_txt.trim();
  };

  const generateDuodenumText = () => {
    let d_txt = "";
    if (duoNormal) {
      d_txt = aiMode ?
      `Bulbo duodenal amplo. Segunda porção duodenal com pregueado de Kerckring preservado e papila de aspecto macroscópico habitual.` :
      `Bulbo e segunda porção sem alterações.`;
    } else {
      if (duoData.duodenite) {
        d_txt += "Mucosa do bulbo enantematosa (Duodenite). ";
      }
      if (duoData.ulcera) {
        d_txt += "Lesão ulcerada em bulbo duodenal. ";
      }

      if (duoData.celiaca) {
        let achadosCel = [];
        if (duoData.celAtrofia) achadosCel.push("atrofia de vilosidades");
        if (duoData.celMosaico) achadosCel.push("aspecto em mosaico");
        if (duoData.celSerrilhado) achadosCel.push("serrilhado de pregas");

        let descCel = achadosCel.length > 0 ? achadosCel.join(", ") : aiMode ? "redução do pregueado, serrilhado e mosaico" : "sinais de atrofia vilositária";
        d_txt += aiMode ? `\nSegunda porção duodenal apresentando ${descCel}. ` : `\nPresença de ${descCel} na segunda porção duodenal. `;
      }

      if (duoData.diverticulo) {
        d_txt += "\nDivertículo de boca larga na segunda porção duodenal (periampular). ";
      }

      if (d_txt === "") d_txt = "Bulbo e segunda porção duodenais sem alterações.";
    }
    return d_txt.trim();
  };

  const generateConclusionsText = () => {
    let conclusions = [];
    if (!esoNormal) {
      if (esoData.neoplasia) conclusions.push(`Tumor de Esôfago em ${esoData.neoLocal} (Suspeita de Neoplasia)`);
      if (esoData.esofagite) {
        if (esoData.esofagiteId) {
          const rep = getEsophagitisReport(esoData.esofagiteId, esoData.esofagiteSubclassificacao, aiMode);
          if (rep) conclusions.push(rep.conclusao);
        } else {
          conclusions.push(`Esofagite de Refluxo (Los Angeles ${esoData.grauEsofagite})`);
        }
      }
      if (esoData.anatomicoId) {
        const rep = getAnatomicalReport(esoData.anatomicoId, esoData.tamHernia);
        if (rep && rep.conclusao) conclusions.push(rep.conclusao);
      } else if (esoData.hernia) {
        conclusions.push(`Hérnia Hiatal por deslizamento (${esoData.tamHernia || 3}cm)`);
      }
      if (esoData.hiatoLaxo) {
        const rep = getAnatomicalReport('pinçamento_laxo');
        if (rep) conclusions.push(rep.conclusao);
      }
      if (esoData.varizes) {
        let cal_txt = esoData.varizesCalibre === 'fino' ? "fino calibre" : esoData.varizesCalibre === 'medio' ? "médio calibre" : "grosso calibre";
        let conc_var = `Varizes Esofágicas de ${cal_txt}`;
        if (esoData.varizesRedSpots) conc_var += " com sinais de alto risco";
        conclusions.push(conc_var);
      }
      if (esoData.barrett) conclusions.push(`Suspeita de Esôfago de Barrett (Praga C${esoData.barrettC}M${esoData.barrettM})`);
      if (esoData.eosinofilica && !esoData.esofagiteId) conclusions.push("Suspeita de Esofagite Eosinofílica");
      if (esoData.candida && !esoData.esofagiteId) conclusions.push(`Candidíase Esofágica (Kodsi ${esoData.candidaKodsi})`);
      if (esoData.diverticulo) conclusions.push("Divertículo Esofágico");
      if (esoData.malloryWeiss) conclusions.push("Laceração de Mallory-Weiss");
      if (esoData.estenose) conclusions.push(`Estenose Esofágica`);
      if (esoData.ulcera) conclusions.push("Úlcera Esofágica");
    }

    if (!estoNormal) {
      if (estoData.neoplasia) conclusions.push(`Neoplasia Gástrica Avançada (Borrmann ${estoData.neoBorrmann}) de ${estoData.neoLocal}`);
      if (estoData.gastrite && (!estoData.atrofia || estoData.gastriteTipo !== 'Enantematosa')) {
        conclusions.push(`Gastrite ${estoData.gastriteTipo} ${estoData.gastriteIntensidade} de ${estoData.gastriteLocal}`);
      }
      if (estoData.atrofia) {
        conclusions.push(`Gastrite Atrófica (Kimura-Takemoto ${estoData.kimura})`);
        if (estoData.metaplasia) conclusions.push("Metaplasia Intestinal Gástrica");
      }
      if (estoData.polipo) {
        let conduta_nome = estoData.polipoConduta === 'biopsia' ? "biopsiado" : "ressecado";
        conclusions.push(`Pólipo gástrico de ${estoData.polipoLocal} ${conduta_nome} (Paris ${estoData.polipoParis})`);
      }
      if (estoData.subepitelial) conclusions.push("Lesão subepitelial gástrica (Sugestiva de Lipoma/GIST/Leiomioma)");
      if (estoData.xantelasma) conclusions.push("Xantelasma Gástrico");
      if (estoData.gave) conclusions.push("Ectasia Vascular Antral Gástrica (GAVE)");
      if (estoData.urease) conclusions.push(`Teste de Urease: ${estoData.ureaseRes}`);
    }

    if (!duoNormal) {
      if (duoData.duodenite) conclusions.push("Duodenite Erosiva");
      if (duoData.ulcera) conclusions.push("Úlcera Bulbar");
      if (duoData.celiaca) conclusions.push("Sinais endoscópicos sugestivos de atrofia vilositária (Suspeita de Doença Celíaca)");
      if (duoData.diverticulo) conclusions.push("Divertículo Duodenal Periampular");
    }

    if (conclusions.length === 0 && conclusionTemplates.length === 0) return "1. Exame dentro dos padrões da normalidade.";

    // Append conclusion templates after auto-generated conclusions
    const allConclusions = [
      ...conclusions,
      ...conclusionTemplates.map(t => t.content)
    ];
    return allConclusions.map((c, i) => `${i + 1}. ${c}`).join('\n');
  };

  const generateObsText = () => {
    let obs = [];
    if (preparoInadequado) {
      obs.push("Preparo inadequado, limitando a avaliação completa de algumas áreas.");
    }
    if (!esoNormal) {
      if (esoData.neoplasia) obs.push("Realizadas biópsias da lesão esofágica.");
      if (esoData.esofagite && esoData.esofagiteId) {
        const rep = getEsophagitisReport(esoData.esofagiteId, esoData.esofagiteSubclassificacao, aiMode);
        if (rep && rep.biopsy) obs.push(rep.biopsyDesc || "Realizadas biópsias da mucosa esofágica.");
      }
      if (esoData.barrett) obs.push("Biópsias realizadas em protocolo de Seattle para confirmação histológica de Barrett.");
      if (esoData.eosinofilica && !esoData.esofagiteId) obs.push("Realizadas biópsias seriadas de esôfago (proximal/distal) para contagem de eosinófilos.");
    }
    if (!estoNormal) {
      if (estoData.neoplasia) obs.push("Realizadas múltiplas biópsias da lesão gástrica.");
      if (estoData.atrofia && estoData.sydney) obs.push("Realizadas biópsias gástricas (Protocolo de Sydney) para estadiamento OLGA/OLGIM.");
    }
    if (!duoNormal) {
      if (duoData.celiaca) obs.push("Realizadas biópsias de segunda porção duodenal para investigação de enteropatia.");
    }

    return obs.map(o => `* ${o}`).join('\n');
  };

  const generateFullReport = (prefixes) => {
    const p = prefixes || { esophagus: '', stomach: '', duodenum: '' };
    const procText = generateProceduresText();
    return buildReportFromSections({
      header: generateHeaderText(),
      esophagus: p.esophagus ? `${p.esophagus}\n${generateEsophagusText()}`.trim() : generateEsophagusText(),
      stomach: p.stomach ? `${p.stomach}\n${generateStomachText()}`.trim() : generateStomachText(),
      duodenum: p.duodenum ? `${p.duodenum}\n${generateDuodenumText()}`.trim() : generateDuodenumText(),
      procedures: procText,
      conclusion: generateConclusionsText(),
      obs: generateObsText(),
      signature: `Assinado eletronicamente por:\n${doctorName} - ${doctorCrm}`
    });
  };

  const [hasManualEdits, setHasManualEdits] = useState(false);
  // Template prefixes per section — combined with auto-generated findings text
  const [templatePrefixes, setTemplatePrefixes] = useState({
    esophagus: '',
    stomach: '',
    duodenum: ''
  });

  const prevEsoDataRef = React.useRef(esoData);
  const prevEsoNormalRef = React.useRef(esoNormal);
  const prevEstoDataRef = React.useRef(estoData);
  const prevEstoNormalRef = React.useRef(estoNormal);
  const prevDuoDataRef = React.useRef(duoData);
  const prevDuoNormalRef = React.useRef(duoNormal);
  const prevHeaderRef = React.useRef({ paciente, indicacao, preparoInadequado });
  const prevTemplatePrefixesRef = React.useRef({ esophagus: '', stomach: '', duodenum: '' });

  // Combine template prefix + auto-generated findings for a section
  const buildSectionText = (prefix, generatedText) => {
    if (!prefix) return generatedText;
    if (!generatedText) return prefix;
    return `${prefix}\n${generatedText}`;
  };

  const handleApplyTemplate = (sectionKey, content) => {
    // Store the template as a prefix for this section
    setTemplatePrefixes(prev => ({ ...prev, [sectionKey]: content }));
    setHasManualEdits(true);
  };

  const handleReportChange = (newVal) => {
    setReport(newVal);
    setHasManualEdits(true);
  };

  useEffect(() => {
    if (!report || !hasManualEdits) {
      // First render or after reset — regenerate everything (include any active prefixes)
      const full = generateFullReport(templatePrefixes);
      setReport(full);

      prevEsoNormalRef.current = esoNormal;
      prevEsoDataRef.current = esoData;
      prevEstoNormalRef.current = estoNormal;
      prevEstoDataRef.current = estoData;
      prevDuoNormalRef.current = duoNormal;
      prevDuoDataRef.current = duoData;
      prevHeaderRef.current = { paciente, indicacao, preparoInadequado };
      prevTemplatePrefixesRef.current = templatePrefixes;
    } else {
      let isChanged = false;
      const sections = parseReportSections(report);

      // Header — always regenerate when patient/indication changes
      if (prevHeaderRef.current.paciente !== paciente ||
          prevHeaderRef.current.indicacao !== indicacao ||
          prevHeaderRef.current.preparoInadequado !== preparoInadequado) {
        sections.header = generateHeaderText();
        prevHeaderRef.current = { paciente, indicacao, preparoInadequado };
        isChanged = true;
      }

      // Esophagus — regenerate + prepend template prefix when data or prefix changes
      const esoChanged = prevEsoNormalRef.current !== esoNormal || prevEsoDataRef.current !== esoData;
      const esoPrefixChanged = prevTemplatePrefixesRef.current.esophagus !== templatePrefixes.esophagus;
      if (esoChanged || esoPrefixChanged) {
        prevEsoNormalRef.current = esoNormal;
        prevEsoDataRef.current = esoData;
        sections.esophagus = buildSectionText(templatePrefixes.esophagus, generateEsophagusText());
        isChanged = true;
      }

      // Stomach — regenerate + prepend template prefix when data or prefix changes
      const estoChanged = prevEstoNormalRef.current !== estoNormal || prevEstoDataRef.current !== estoData;
      const estoPrefixChanged = prevTemplatePrefixesRef.current.stomach !== templatePrefixes.stomach;
      if (estoChanged || estoPrefixChanged) {
        prevEstoNormalRef.current = estoNormal;
        prevEstoDataRef.current = estoData;
        sections.stomach = buildSectionText(templatePrefixes.stomach, generateStomachText());
        isChanged = true;
      }

      // Duodenum — regenerate + prepend template prefix when data or prefix changes
      const duoChanged = prevDuoNormalRef.current !== duoNormal || prevDuoDataRef.current !== duoData;
      const duoPrefixChanged = prevTemplatePrefixesRef.current.duodenum !== templatePrefixes.duodenum;
      if (duoChanged || duoPrefixChanged) {
        prevDuoNormalRef.current = duoNormal;
        prevDuoDataRef.current = duoData;
        sections.duodenum = buildSectionText(templatePrefixes.duodenum, generateDuodenumText());
        isChanged = true;
      }

      if (isChanged) {
        prevTemplatePrefixesRef.current = templatePrefixes;
        // Conclusion, obs and procedures always reflect current state
        sections.procedures = generateProceduresText();
        sections.conclusion = generateConclusionsText();
        sections.obs = generateObsText();
        setReport(buildReportFromSections(sections));
      }
    }
  }, [
    paciente, indicacao, preparoInadequado,
    esoNormal, esoData,
    estoNormal, estoData,
    duoNormal, duoData,
    aiMode, doctorName, doctorCrm,
    hasManualEdits, templatePrefixes, conclusionTemplates, proceduresData
  ]);

  const handleToggleAI = () => {
    if (!aiMode) {
      setAiLoading(true);
      setTimeout(() => {
        setAiMode(true);
        setAiLoading(false);
      }, 800);
    } else {
      // Reset clears template prefixes and regenerates the full report
      setAiMode(false);
      setHasManualEdits(false);
      setTemplatePrefixes({ esophagus: '', stomach: '', duodenum: '' });
      setConclusionTemplates([]);
      setProceduresData({});
      setReport('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveReport = () => {
    if (!selectedPatient) {
      alert('Por favor, selecione um paciente antes de salvar o laudo.');
      return;
    }

    if (!report.trim()) {
      alert('O laudo está vazio.');
      return;
    }

    const conclusions = [];
    // Parse conclusions from report
    const conclusionMatch = report.match(/CONCLUSÃO:\n([\s\S]*?)(?:\n\nCONDUTA|$)/);
    if (conclusionMatch) {
      const conclusionText = conclusionMatch[1];
      const lines = conclusionText.split('\n').filter((l) => l.trim());
      lines.forEach((line) => {
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        if (cleaned) conclusions.push(cleaned);
      });
    }

    const reportData = {
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      indication: indicacao,
      report_content: report,
      exam_date: new Date().toISOString().split('T')[0],
      findings: {
        esophagus: esoData,
        stomach: estoData,
        duodenum: duoData
      },
      conclusions: conclusions,
      biopsy_requested: checkBiopsyNeeded()
    };

    setSaving(true);
    saveReportMutation.mutate(reportData);
  };

  const handleReset = () => {
    if (confirm("Deseja iniciar um novo laudo? Todos os dados serão apagados.")) {
      setPaciente('');
      setIndicacao('Dispepsia');
      setPreparoInadequado(false);
      setEsoNormal(true);
      setEsoData({
        neoplasia: false, neoTipo: 'vegetante', neoLocal: 'terço distal', neoEstenose: false,
        esofagite: false, grauEsofagite: 'A', hernia: false, anatomicoId: 'teg_alinhada', tamHernia: 40,
        varizes: false, varizesCalibre: 'fino', varizesRedSpots: false,
        barrett: false, barrettC: 0, barrettM: 0, eosinofilica: false,
        candida: false, candidaKodsi: 'I', estenose: false, ulcera: false,
        diverticulo: false, malloryWeiss: false
      });
      setEstoNormal(true);
      setEstoData({
        neoplasia: false, neoBorrmann: 'I', neoLocal: 'Antro',
        gastrite: false, gastriteTipo: 'Enantematosa', gastriteIntensidade: 'Leve', gastriteLocal: 'Antro',
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
      setHasManualEdits(false);
      setTemplatePrefixes({ esophagus: '', stomach: '', duodenum: '' });
      setConclusionTemplates([]);
      setProceduresData({});
      setReport('');
      setSelectedPatient(null);
    }
  };

  const wordCount = report.trim().split(/\s+/).length;

  const esophagusTemplates = templates?.filter(t => t.category === 'Esôfago' || t.category === 'Geral') || [];
  const stomachTemplates = templates?.filter(t => t.category === 'Estômago' || t.category === 'Geral') || [];
  const duodenumTemplates = templates?.filter(t => t.category === 'Duodeno' || t.category === 'Geral') || [];
  const conclusionTplList = templates?.filter(t => t.category === 'Conclusão') || [];

  const handleApplyConclusion = (content, removeIdx) => {
    setConclusionTemplates(prev => {
      if (removeIdx !== undefined && removeIdx !== null) {
        // Remove by index
        return prev.filter((_, i) => i !== removeIdx);
      }
      // Find matching template name for display chip
      const tpl = conclusionTplList.find(t => t.content === content);
      const name = tpl ? tpl.name : `Conclusão ${prev.length + 1}`;
      return [...prev, { name, content }];
    });
    setHasManualEdits(true);
  };

  const handleClearConclusions = () => {
    setConclusionTemplates([]);
    setHasManualEdits(true);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col lg:flex-row h-screen bg-slate-50 text-slate-700">
        {/* LEFT PANEL - FORM */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto border-r border-slate-200">
          <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">EndoOren.AI


                </h1>
                <p className="text-sm text-slate-500 font-medium ml-1 mt-1"></p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {user?.email === 'clauorenstein@gmail.com' && (
                  <Link to={createPageUrl('Admin')}>
                    <Button variant="ghost" size="sm" className="gap-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-semibold">
                      <Hammer className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                )}
                <Link to={createPageUrl('Patients')}>
                  <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-700">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Pacientes</span>
                  </Button>
                </Link>
                <Link to={createPageUrl('Settings')}>
                  <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-700">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Config</span>
                  </Button>
                </Link>
                <button
                  onClick={handleReset}
                  className="text-slate-500 hover:text-red-600 font-medium text-xs flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 group">
                  
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Novo</span>
                </button>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-slate-500 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <PatientSelector
                selectedPatient={selectedPatient}
                onSelectPatient={(patient) => {
                  setSelectedPatient(patient);
                  if (patient) {
                    setPaciente(patient.name);
                  } else {
                    setPaciente('');
                  }
                }} />
              

              <IdentificationSection
                paciente={paciente}
                setPaciente={setPaciente}
                indicacao={indicacao}
                setIndicacao={setIndicacao}
                customIndications={customIndications} />
              

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
                    className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
                  
                  <span className="text-sm font-medium text-red-600">Preparo Inadequado</span>
                </label>
              </div>

              <EsophagusSection
                isNormal={esoNormal}
                setIsNormal={setEsoNormal}
                data={esoData}
                setData={setEsoData}
                templates={esophagusTemplates}
                onApplyTemplate={(content) => handleApplyTemplate('esophagus', content)} />
              

              <StomachSection
                isNormal={estoNormal}
                setIsNormal={setEstoNormal}
                data={estoData}
                setData={setEstoData}
                templates={stomachTemplates}
                onApplyTemplate={(content) => handleApplyTemplate('stomach', content)} />
              

              <DuodenumSection
                isNormal={duoNormal}
                setIsNormal={setDuoNormal}
                data={duoData}
                setData={setDuoData}
                templates={duodenumTemplates}
                onApplyTemplate={(content) => handleApplyTemplate('duodenum', content)} />
              

              <ConclusionTemplates
                templates={conclusionTplList}
                activeTemplates={conclusionTemplates}
                onApplyTemplate={handleApplyConclusion}
                onClearTemplates={handleClearConclusions} />

              <ProceduresSection
                data={proceduresData}
                setData={setProceduresData} />

              <div className="h-24" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - PREVIEW */}
        <div className="w-full lg:w-1/2 h-full bg-slate-100 p-4 lg:p-6 flex flex-col items-center justify-center border-l border-slate-200">
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
            onSaveReport={handleSaveReport}
            saving={saving}
            hasPatient={!!selectedPatient}
            onReportChange={handleReportChange} />
          
        </div>

        <BiopsyModal
          open={biopsyModalOpen}
          onClose={() => setBiopsyModalOpen(false)}
          paciente={paciente}
          doctorName={`${doctorName} - ${doctorCrm}`}
          esoData={esoData}
          estoData={estoData}
          duoData={duoData} />
        
      </div>
    </TooltipProvider>);

}
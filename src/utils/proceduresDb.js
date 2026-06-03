// ============================================================
// Banco de dados de Procedimentos Endoscópicos
// ============================================================

export const PROCEDURE_CATEGORIES = [
  'Diagnóstico',
  'Hemostasia Não Varicosa',
  'Hemostasia Varicosa',
  'Ressecção de Mucosa',
  'Intervenção / Acesso',
  'Avançado'
];

// Cada procedimento:
//   id: identificador único
//   category: categoria de exibição
//   name: nome exibido no UI
//   color: classe de cor do card
//   hasCount: se precisa de campo numérico (ex: nº de anéis, clips)
//   countLabel: rótulo do campo numérico
//   countDefault: valor padrão do campo numérico
//   subtypes: array de subtipos {id, name, text}
//   text: texto base do laudo (quando não há subtipo obrigatório)
//         pode usar {count} como placeholder
//   requiresSubtype: se true, precisa de subtipo selecionado para gerar texto

export const PROCEDURES = [
  // ─── DIAGNÓSTICO ─────────────────────────────────────────
  {
    id: 'biopsia',
    category: 'Diagnóstico',
    name: 'Biópsia Endoscópica (com Pinça)',
    color: 'blue',
    requiresSubtype: true,
    subtypes: [
      {
        id: 'sydney',
        name: 'Protocolo de Sydney',
        text: 'Biópsias gástricas coletadas conforme Protocolo de Sydney (5 fragmentos: 2 do antro, 1 da incisura angular e 2 do corpo) para estadiamento histológico (OLGA/OLGIM). Amostras acondicionadas em formalina e encaminhadas para análise anatomopatológica.'
      },
      {
        id: 'seattle',
        name: 'Protocolo de Seattle (Barrett)',
        text: 'Biópsias quadrânticas realizadas conforme Protocolo de Seattle (a cada 1-2 cm) nas áreas de mucosa colunar suspeita de Esôfago de Barrett. Amostras encaminhadas para análise anatomopatológica.'
      },
      {
        id: 'pylori',
        name: 'Pesquisa de H. pylori',
        text: 'Biópsias antrais coletadas para pesquisa de Helicobacter pylori (teste rápido da urease e análise histopatológica).'
      },
      {
        id: 'celiaca',
        name: 'Protocolo de Doença Celíaca',
        text: 'Biópsias seriadas realizadas da segunda porção duodenal (mínimo 4 fragmentos) e do bulbo duodenal para investigação de enteropatia celíaca. Amostras encaminhadas para análise anatomopatológica.'
      },
      {
        id: 'lesao',
        name: 'Biópsia de Lesão Focal',
        text: 'Biópsias realizadas em lesão focal suspeita para análise histopatológica. Amostras acondicionadas em formalina e encaminhadas para anatomopatológico.'
      }
    ]
  },
  {
    id: 'cromoscopia',
    category: 'Diagnóstico',
    name: 'Cromoscopia',
    color: 'blue',
    requiresSubtype: true,
    subtypes: [
      {
        id: 'lugol',
        name: 'Lugol',
        text: 'Cromoscopia química realizada com solução de Lugol no esôfago. Observadas áreas Lugol-negativas suspeitas, que foram biopsiadas para análise histopatológica.'
      },
      {
        id: 'azul_metileno',
        name: 'Azul de Metileno / Índigo Carmim',
        text: 'Cromoscopia química realizada com azul de metileno/índigo carmim para contrastar o relevo mucoso e delimitar margens da lesão.'
      },
      {
        id: 'nbi',
        name: 'NBI / Cromoscopia Óptica Digital',
        text: 'Cromoscopia óptica digital (NBI/BLI) utilizada para caracterização de padrão vascular e mucoso, auxiliando na delimitação e classificação da lesão.'
      }
    ]
  },

  // ─── HEMOSTASIA NÃO VARICOSA ─────────────────────────────
  {
    id: 'injecao',
    category: 'Hemostasia Não Varicosa',
    name: 'Terapia Injetora',
    color: 'red',
    requiresSubtype: true,
    subtypes: [
      {
        id: 'adrenalina',
        name: 'Adrenalina 1:10.000',
        text: 'Terapia injetora realizada com injeção de adrenalina diluída (1:10.000) no leito e bordas da lesão hemorrágica para vasoconstrição e hemostasia química. Volume total injetado: {volume} mL.'
      },
      {
        id: 'glicose',
        name: 'Glicose Hipertônica',
        text: 'Injeção submucosa de glicose hipertônica no leito lesional para hemostasia por compressão volumétrica.'
      },
      {
        id: 'etanolamina',
        name: 'Etanolamina',
        text: 'Injeção de etanolamina no leito hemorrágico para hemostasia/escleroterapia química.'
      }
    ]
  },
  {
    id: 'apc',
    category: 'Hemostasia Não Varicosa',
    name: 'Plasma de Argônio (APC)',
    color: 'red',
    requiresSubtype: false,
    text: 'Coagulação com plasma de argônio (APC) realizada sobre área hemorrágica/lesional para hemostasia sem contato físico direto. Hemostasia obtida com sucesso.'
  },
  {
    id: 'eletrocoagulacao',
    category: 'Hemostasia Não Varicosa',
    name: 'Eletrocoagulação',
    color: 'red',
    requiresSubtype: false,
    text: 'Eletrocoagulação bipolar realizada diretamente sobre vaso visível/sangrante. Hemostasia obtida com sucesso.'
  },
  {
    id: 'hemoclip',
    category: 'Hemostasia Não Varicosa',
    name: 'Hemoclips Endoscópicos',
    color: 'red',
    requiresSubtype: false,
    hasCount: true,
    countLabel: 'Nº de clips',
    countDefault: 1,
    text: 'Aplicação de {count} hemoclip(s) endoscópico(s) sobre vaso visível/sangrante, com obtenção de hemostasia mecânica imediata.'
  },
  {
    id: 'po_hemostatico',
    category: 'Hemostasia Não Varicosa',
    name: 'Pó Hemostático',
    color: 'red',
    requiresSubtype: false,
    text: 'Aplicação de pó hemostático mineral sobre área hemorrágica, com formação de coágulo por contato com fluidos corporais. Hemostasia obtida com sucesso.'
  },

  // ─── HEMOSTASIA VARICOSA ─────────────────────────────────
  {
    id: 'leve',
    category: 'Hemostasia Varicosa',
    name: 'Ligadura Elástica de Varizes (LEVE)',
    color: 'purple',
    requiresSubtype: false,
    hasCount: true,
    countLabel: 'Nº de anéis',
    countDefault: 3,
    text: 'Ligadura elástica de varizes esofágicas (LEVE) realizada com aplicação de {count} anel(is) elástico(s) sobre os cordões varicosos, do distal para o proximal. Procedimento sem intercorrências.'
  },
  {
    id: 'escleroterapia',
    category: 'Hemostasia Varicosa',
    name: 'Escleroterapia de Varizes',
    color: 'purple',
    requiresSubtype: true,
    subtypes: [
      {
        id: 'intra',
        name: 'Intravariceal',
        text: 'Escleroterapia intravariceal realizada com injeção de agente esclerosante diretamente nos cordões varicosos esofágicos. Procedimento sem intercorrências.'
      },
      {
        id: 'peri',
        name: 'Perivariceal',
        text: 'Escleroterapia perivariceal realizada com injeção de agente esclerosante adjacente aos cordões varicosos esofágicos. Procedimento sem intercorrências.'
      }
    ]
  },
  {
    id: 'cianoacrilato',
    category: 'Hemostasia Varicosa',
    name: 'Injeção de Cianoacrilato',
    color: 'purple',
    requiresSubtype: false,
    text: 'Injeção de cianoacrilato (cola biológica) realizada nas varizes gástricas para obliteração vascular imediata. Procedimento sem intercorrências.'
  },

  // ─── RESSECÇÃO DE MUCOSA ──────────────────────────────────
  {
    id: 'polipectomia',
    category: 'Ressecção de Mucosa',
    name: 'Polipectomia',
    color: 'orange',
    requiresSubtype: true,
    subtypes: [
      {
        id: 'alca',
        name: 'Alça Diatérmica',
        text: 'Polipectomia realizada com alça diatérmica com passagem de corrente elétrica. Pólipo ressecado em monobloco e recuperado. Material encaminhado para análise anatomopatológica.'
      },
      {
        id: 'pinca',
        name: 'Pinça de Biópsia (< 3mm)',
        text: 'Remoção de pólipo diminuto (< 3mm) com pinça de biópsia. Material encaminhado para análise anatomopatológica.'
      },
      {
        id: 'fria',
        name: 'Polipectomia a Frio',
        text: 'Polipectomia a frio realizada com alça sem corrente elétrica. Material encaminhado para análise anatomopatológica.'
      }
    ]
  },
  {
    id: 'emr',
    category: 'Ressecção de Mucosa',
    name: 'Mucosectomia (EMR)',
    color: 'orange',
    requiresSubtype: false,
    text: 'Ressecção endoscópica de mucosa (EMR) realizada. Injeção submucosa prévia de solução (soro fisiológico com adrenalina e azul de metileno) para "lifting" tecidual. Lesão ressecada com alça diatérmica. Peça encaminhada para análise anatomopatológica.'
  },
  {
    id: 'esd',
    category: 'Ressecção de Mucosa',
    name: 'Dissecção Submucosa (ESD)',
    color: 'orange',
    requiresSubtype: false,
    text: 'Dissecção submucosa endoscópica (ESD) realizada com faca endoscópica. Injeção submucosa e dissecção direta do plano submucoso com ressecção em monobloco da lesão. Peça encaminhada para análise anatomopatológica.'
  },

  // ─── INTERVENÇÃO / ACESSO ─────────────────────────────────
  {
    id: 'dilatacao',
    category: 'Intervenção / Acesso',
    name: 'Dilatação Endoscópica',
    color: 'teal',
    requiresSubtype: true,
    subtypes: [
      {
        id: 'savary',
        name: 'Savary-Gilliard',
        text: 'Dilatação realizada com velas de Savary-Gilliard progressivas sobre fio-guia metálico. Bom resultado com alargamento do calibre luminal. Procedimento sem intercorrências.'
      },
      {
        id: 'balao_cre',
        name: 'Balão Pneumático (CRE)',
        text: 'Dilatação pneumática/hidráulica realizada com balão CRE insuflado sob pressão hidrostática controlada. Bom resultado com alargamento do calibre luminal. Procedimento sem intercorrências.'
      }
    ]
  },
  {
    id: 'corpo_estranho',
    category: 'Intervenção / Acesso',
    name: 'Remoção de Corpo Estranho',
    color: 'teal',
    requiresSubtype: false,
    text: 'Remoção endoscópica de corpo estranho/impactação alimentar realizada com sucesso utilizando pinça/alça/rede de captura. Esôfago examinado após a retirada sem evidência de lesão mucosa significativa.'
  },
  {
    id: 'gep',
    category: 'Intervenção / Acesso',
    name: 'Gastrostomia Percutânea (GEP/PEG)',
    color: 'teal',
    requiresSubtype: false,
    text: 'Gastrostomia endoscópica percutânea (GEP/PEG) realizada sob orientação endoscópica para posicionamento de sonda alimentar de longa permanência. Procedimento realizado sem intercorrências.'
  },
  {
    id: 'stent',
    category: 'Intervenção / Acesso',
    name: 'Prótese Metálica Autoexpansível (Stent)',
    color: 'teal',
    requiresSubtype: false,
    text: 'Implante de prótese metálica autoexpansível realizado para manutenção da patência do lúmen em área de estenose/compressão neoplásica. Boa expansão protética confirmada endoscópica e radiologicamente.'
  },

  // ─── AVANÇADO ─────────────────────────────────────────────
  {
    id: 'poem',
    category: 'Avançado',
    name: 'POEM (Miotomia Endoscópica Peroral)',
    color: 'indigo',
    requiresSubtype: false,
    text: 'Miotomia endoscópica peroral (POEM) realizada com criação de túnel submucoso no esôfago médio, dissecção extensa e miotomia circular seletiva do esôfago distal e esfíncter esofágico inferior. Fechamento do acesso mucoso com clips endoscópicos. Procedimento sem intercorrências.'
  },
  {
    id: 'balao_intragastrico',
    category: 'Avançado',
    name: 'Balão Intragástrico',
    color: 'indigo',
    requiresSubtype: true,
    subtypes: [
      {
        id: 'implante',
        name: 'Implante',
        text: 'Implante de balão intragástrico realizado com posicionamento no lúmen gástrico e preenchimento com solução salina acrescida de azul de metileno. Balão devidamente posicionado e calibrado. Procedimento sem intercorrências.'
      },
      {
        id: 'retirada',
        name: 'Retirada',
        text: 'Retirada de balão intragástrico realizada com punção, esvaziamento e extração endoscópica. Estômago examinado após a retirada sem evidência de complicações mucosas.'
      }
    ]
  },
  {
    id: 'rfa',
    category: 'Avançado',
    name: 'Ablação por Radiofrequência (RFA - Barrett)',
    color: 'indigo',
    requiresSubtype: false,
    text: 'Ablação por radiofrequência (RFA) realizada sobre epitélio metaplásico de Esôfago de Barrett utilizando cateter de ablação circunferencial/focal. Destruição térmica controlada da mucosa colunar para regeneração com epitélio escamoso normal. Procedimento sem intercorrências.'
  }
];

// Gera o texto do laudo para um procedimento dado seu estado
export const generateProcedureText = (proc, state) => {
  if (!state?.selected) return null;

  let baseText = '';

  if (proc.subtypes && proc.subtypes.length > 0 && state.subtype) {
    const sub = proc.subtypes.find(s => s.id === state.subtype);
    if (sub) baseText = sub.text;
  } else if (!proc.requiresSubtype && proc.text) {
    baseText = proc.text;
  }

  if (!baseText) return null;

  // Replace placeholders
  const count = state.count ?? proc.countDefault ?? 1;
  const volume = state.volume ?? 5;
  return baseText
    .replace(/{count}/g, count)
    .replace(/{volume}/g, volume);
};

export const CATEGORY_COLORS = {
  'Diagnóstico': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'Hemostasia Não Varicosa': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  'Hemostasia Varicosa': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'Ressecção de Mucosa': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  'Intervenção / Acesso': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
  'Avançado': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' }
};

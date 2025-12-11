import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Stethoscope } from 'lucide-react';

const INDICACOES = [
  { group: "Sintomas Dispépticos/Gerais", options: [
    { value: "Dispepsia", label: "Dispepsia Funcional / Investigação" },
    { value: "Dor Epigástrica", label: "Dor Epigástrica / Abdominal" },
    { value: "Náuseas e Vômitos", label: "Náuseas e Vômitos Persistentes" },
    { value: "Perda Ponderal", label: "Perda Ponderal (Emagrecimento)" },
  ]},
  { group: "Esôfago / Refluxo", options: [
    { value: "Doença do Refluxo (DRGE)", label: "DRGE / Pirose / Regurgitação" },
    { value: "Disfagia", label: "Disfagia (Dificuldade de engolir)" },
    { value: "Odinofagia", label: "Odinofagia (Dor ao engolir)" },
    { value: "Tosse Crônica", label: "Tosse Crônica / Refluxo Atípico" },
    { value: "Ingestão de Corpo Estranho", label: "Ingestão de Corpo Estranho" },
    { value: "Impactação Alimentar", label: "Impactação Alimentar" },
  ]},
  { group: "Sangramento / Anemia", options: [
    { value: "Hemorragia Digestiva Alta", label: "Hemorragia Digestiva Alta (HDA)" },
    { value: "Melena", label: "Melena / Hematêmese" },
    { value: "Anemia Ferropriva", label: "Anemia Ferropriva a Esclarecer" },
  ]},
  { group: "Rastreamento e Controle", options: [
    { value: "Rastreamento de Varizes", label: "Rastreamento de Varizes (Hepatopatia)" },
    { value: "Barrett", label: "Vigilância de Esôfago de Barrett" },
    { value: "Rastreamento de CA Gástrico", label: "Rastreamento de Neoplasia (CA)" },
    { value: "Suspeita de Doença Celíaca", label: "Investigação de Doença Celíaca" },
  ]},
];

export default function IdentificationSection({ paciente, setPaciente, indicacao, setIndicacao }) {
  return (
    <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Identificação</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome do Paciente</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <Input
              type="text"
              value={paciente}
              onChange={(e) => setPaciente(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-sky-500"
              placeholder="Nome completo..."
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Indicação Clínica</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 z-10 pointer-events-none">
              <Stethoscope className="w-4 h-4" />
            </span>
            <Select value={indicacao} onValueChange={setIndicacao}>
              <SelectTrigger className="pl-10 bg-slate-50 border-slate-200">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {INDICACOES.map((group) => (
                  <React.Fragment key={group.group}>
                    <div className="px-2 py-1.5 text-xs font-bold text-slate-500 bg-slate-50">{group.group}</div>
                    {group.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, FileText, Trash2, Plus, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';

import DoctorSettings from '@/components/settings/DoctorSettings';
import IndicationsSettings from '@/components/settings/IndicationsSettings';
import TemplatesSettings from '@/components/settings/TemplatesSettings';

const DEFAULT_INDICATIONS = [
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

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await base44.entities.Settings.list();
      if (result && result.length > 0) {
        return result[0];
      }
      return null;
    }
  });

  // States
  const [doctorName, setDoctorName] = useState('');
  const [doctorCrm, setDoctorCrm] = useState('');
  const [customIndications, setCustomIndications] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);

  useEffect(() => {
    if (settings) {
      setDoctorName(settings.doctor_name || '');
      setDoctorCrm(settings.doctor_crm || '');
      setCustomIndications(settings.custom_indications || []);
      setCustomTemplates(settings.custom_templates || []);
    }
  }, [settings]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Settings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Settings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  const handleSave = () => {
    const data = {
      doctor_name: doctorName,
      doctor_crm: doctorCrm,
      custom_indications: customIndications,
      custom_templates: customTemplates
    };

    if (settings && settings.id) {
      updateMutation.mutate({ id: settings.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('EndoReport')}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <SettingsIcon className="w-6 h-6 text-sky-600" />
                  Configurações
                </h1>
                <p className="text-sm text-slate-500 mt-1">Personalize suas preferências do EndoReport</p>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              className="bg-sky-600 hover:bg-sky-700 gap-2"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="doctor" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
            <TabsTrigger value="doctor" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Médico</span>
            </TabsTrigger>
            <TabsTrigger value="indications" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Indicações</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctor">
            <DoctorSettings
              doctorName={doctorName}
              setDoctorName={setDoctorName}
              doctorCrm={doctorCrm}
              setDoctorCrm={setDoctorCrm}
            />
          </TabsContent>

          <TabsContent value="indications">
            <IndicationsSettings
              customIndications={customIndications}
              setCustomIndications={setCustomIndications}
              defaultIndications={DEFAULT_INDICATIONS}
            />
          </TabsContent>

          <TabsContent value="templates">
            <TemplatesSettings
              customTemplates={customTemplates}
              setCustomTemplates={setCustomTemplates}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
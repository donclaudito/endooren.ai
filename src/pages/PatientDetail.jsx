import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, User, Calendar, Phone, Mail, FileText, AlertCircle,
  Pill, Activity, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';

import PatientDialog from '@/components/patients/PatientDialog';
import ReportCard from '@/components/patients/ReportCard';

export default function PatientDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const results = await base44.entities.Patient.filter({ id: patientId });
      return results[0] || null;
    },
    enabled: !!patientId
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['patient-reports', patientId],
    queryFn: () => base44.entities.Report.filter({ patient_id: patientId }, '-created_date'),
    enabled: !!patientId
  });

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (patientLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Paciente não encontrado</h2>
          <p className="text-slate-600 mb-6">O paciente solicitado não existe ou foi removido.</p>
          <Link to={createPageUrl('Patients')}>
            <Button className="bg-sky-600 hover:bg-sky-700">Voltar à Lista</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const age = calculateAge(patient.birth_date);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Patients')}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <User className="w-6 h-6 text-sky-600" />
                  {patient.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1">Ficha do Paciente</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                Editar Dados
              </Button>
              <Link to={createPageUrl('EndoReport') + '?patient_id=' + patient.id}>
                <Button className="bg-sky-600 hover:bg-sky-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Laudo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-600" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">Nome Completo</p>
                  <p className="text-sm text-slate-800 font-medium">{patient.name}</p>
                </div>
                {patient.birth_date && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Data de Nascimento</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-800">
                        {format(new Date(patient.birth_date), 'dd/MM/yyyy')}
                        {age && <span className="text-slate-500 ml-2">({age} anos)</span>}
                      </p>
                    </div>
                  </div>
                )}
                {patient.cpf && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">CPF</p>
                    <p className="text-sm text-slate-800">{patient.cpf}</p>
                  </div>
                )}
                {patient.phone && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Telefone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-800">{patient.phone}</p>
                    </div>
                  </div>
                )}
                {patient.email && (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-800">{patient.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Info */}
            {(patient.medical_history || patient.allergies || patient.current_medications) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-sky-600" />
                    Informações Médicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.allergies && (
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        Alergias
                      </p>
                      <p className="text-sm text-slate-800">{patient.allergies}</p>
                    </div>
                  )}
                  {patient.current_medications && (
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                        <Pill className="w-3 h-3 text-blue-500" />
                        Medicamentos em Uso
                      </p>
                      <p className="text-sm text-slate-800">{patient.current_medications}</p>
                    </div>
                  )}
                  {patient.medical_history && (
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">Histórico Médico</p>
                      <p className="text-sm text-slate-800">{patient.medical_history}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card className="bg-sky-50 border-sky-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-sky-700">{reports.length}</p>
                  <p className="text-sm text-sky-600 font-medium">
                    {reports.length === 1 ? 'Laudo Registrado' : 'Laudos Registrados'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reports History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  Histórico de Laudos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-slate-600">Carregando laudos...</p>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhum laudo registrado</h3>
                    <p className="text-slate-500 mb-6">Comece criando o primeiro laudo para este paciente</p>
                    <Link to={createPageUrl('EndoReport') + '?patient_id=' + patient.id}>
                      <Button className="bg-sky-600 hover:bg-sky-700 gap-2">
                        <Plus className="w-4 h-4" />
                        Criar Primeiro Laudo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <ReportCard key={report.id} report={report} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PatientDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        patient={patient}
      />
    </div>
  );
}
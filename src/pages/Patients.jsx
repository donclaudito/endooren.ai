import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Plus, FileText, Calendar, Phone, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';

import PatientDialog from '@/components/patients/PatientDialog';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date')
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list()
  });

  const getPatientReportCount = (patientId) => {
    return reports.filter(r => r.patient_id === patientId).length;
  };

  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.includes(searchTerm) ||
    patient.phone?.includes(searchTerm)
  );

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPatient(null);
  };

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('EndoReport')}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Laudos
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <Users className="w-6 h-6 text-sky-600" />
                  Pacientes
                </h1>
                <p className="text-sm text-slate-500 mt-1">Gerencie o cadastro de pacientes</p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-sky-600 hover:bg-sky-700 gap-2">
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, CPF ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 h-12"
              />
            </div>
          </div>
          <Card className="p-4 bg-sky-50 border-sky-200">
            <p className="text-xs text-sky-600 font-semibold mb-1">Total de Pacientes</p>
            <p className="text-3xl font-bold text-sky-700">{patients.length}</p>
          </Card>
        </div>

        {/* Patients List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando pacientes...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando seu primeiro paciente'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setDialogOpen(true)} className="bg-sky-600 hover:bg-sky-700 gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Paciente
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => {
              const reportCount = getPatientReportCount(patient.id);
              const age = calculateAge(patient.birth_date);
              
              return (
                <Card key={patient.id} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800 mb-1">{patient.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {age && (
                          <Badge variant="outline" className="text-xs bg-slate-50">
                            {age} anos
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
                          {reportCount} {reportCount === 1 ? 'laudo' : 'laudos'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    {patient.birth_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{format(new Date(patient.birth_date), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                    {patient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(patient)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Link to={createPageUrl('PatientDetail') + '?id=' + patient.id} className="flex-1">
                      <Button size="sm" className="w-full bg-sky-600 hover:bg-sky-700 gap-2">
                        Ver Detalhes
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <PatientDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        patient={editingPatient}
      />
    </div>
  );
}
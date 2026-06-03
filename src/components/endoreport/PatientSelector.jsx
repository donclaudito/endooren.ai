import React, { useState } from 'react';
import { apiClient } from '@/services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, X, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import PatientDialog from '@/components/patients/PatientDialog';

export default function PatientSelector({ selectedPatient, onSelectPatient }) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPatientDialogOpen, setNewPatientDialogOpen] = useState(false);

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.get('/api/patients')
  });

  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = (patient) => {
    onSelectPatient(patient);
    setSelectorOpen(false);
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
    <>
      <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" />
            Paciente
          </h3>
          {selectedPatient && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectPatient(null)}
              className="text-red-600 hover:text-red-700 h-7 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {selectedPatient ? (
          <Card className="p-4 bg-sky-50 border-sky-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-slate-800 mb-1">{selectedPatient.name}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  {selectedPatient.birth_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(selectedPatient.birth_date), 'dd/MM/yyyy')}
                      {calculateAge(selectedPatient.birth_date) && (
                        <span className="text-slate-500">
                          ({calculateAge(selectedPatient.birth_date)} anos)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectorOpen(true)}
                className="ml-2"
              >
                Trocar
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            onClick={() => setSelectorOpen(true)}
            variant="outline"
            className="w-full gap-2 border-dashed border-2 h-auto py-3"
          >
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-slate-600">Selecionar Paciente</span>
          </Button>
        )}
      </div>

      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              Selecionar Paciente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={() => {
                  setSelectorOpen(false);
                  setNewPatientDialogOpen(true);
                }}
                className="bg-sky-600 hover:bg-sky-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhum paciente encontrado</p>
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const age = calculateAge(patient.birth_date);
                  return (
                    <Card
                      key={patient.id}
                      className="p-4 cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all"
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{patient.name}</p>
                          <div className="flex gap-2 mt-1">
                            {age && (
                              <Badge variant="outline" className="text-xs">
                                {age} anos
                              </Badge>
                            )}
                            {patient.phone && (
                              <span className="text-xs text-slate-500">{patient.phone}</span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
                          Selecionar
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PatientDialog
        open={newPatientDialogOpen}
        onClose={() => setNewPatientDialogOpen(false)}
      />
    </>
  );
}
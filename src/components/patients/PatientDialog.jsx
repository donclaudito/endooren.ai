import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from 'lucide-react';

export default function PatientDialog({ open, onClose, patient = null }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    cpf: '',
    phone: '',
    email: '',
    medical_history: '',
    allergies: '',
    current_medications: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        birth_date: patient.birth_date || '',
        cpf: patient.cpf || '',
        phone: patient.phone || '',
        email: patient.email || '',
        medical_history: patient.medical_history || '',
        allergies: patient.allergies || '',
        current_medications: patient.current_medications || ''
      });
    } else {
      setFormData({
        name: '',
        birth_date: '',
        cpf: '',
        phone: '',
        email: '',
        medical_history: '',
        allergies: '',
        current_medications: ''
      });
    }
  }, [patient, open]);

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/api/patients', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/api/patients?id=${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      queryClient.invalidateQueries(['patient']);
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('O nome do paciente é obrigatório');
      return;
    }

    if (patient) {
      updateMutation.mutate({ id: patient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar Paciente' : 'Novo Paciente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome completo do paciente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Medical Info */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">Informações Médicas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                placeholder="Descreva alergias conhecidas..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_medications">Medicamentos em Uso</Label>
              <Textarea
                id="current_medications"
                value={formData.current_medications}
                onChange={(e) => handleChange('current_medications', e.target.value)}
                placeholder="Liste medicamentos atuais..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Histórico Médico Relevante</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => handleChange('medical_history', e.target.value)}
                placeholder="Descreva histórico médico relevante..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-sky-600 hover:bg-sky-700"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {patient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
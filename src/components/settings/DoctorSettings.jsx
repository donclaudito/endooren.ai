import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, IdCard } from 'lucide-react';

export default function DoctorSettings({ doctorName, setDoctorName, doctorCrm, setDoctorCrm }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-sky-600" />
          Informações do Médico
        </CardTitle>
        <CardDescription>
          Configure o nome e CRM do médico que aparecerá nos laudos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="doctor-name" className="text-sm font-semibold text-slate-700">
            Nome Completo do Médico
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <Input
              id="doctor-name"
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr(a). Nome do Médico"
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
          <p className="text-xs text-slate-500">
            Exemplo: Dr. João Silva ou Dra. Maria Santos
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor-crm" className="text-sm font-semibold text-slate-700">
            CRM (Conselho Regional de Medicina)
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <IdCard className="w-4 h-4" />
            </span>
            <Input
              id="doctor-crm"
              type="text"
              value={doctorCrm}
              onChange={(e) => setDoctorCrm(e.target.value)}
              placeholder="CRMSP 123456"
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
          <p className="text-xs text-slate-500">
            Exemplo: CRMSP 123456 ou CRM-RJ 78910
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Preview da Assinatura</h4>
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="text-sm text-slate-700">
              Assinado eletronicamente por:
            </p>
            <p className="text-sm font-bold text-slate-900">
              {doctorName || 'Dr(a). [Nome não configurado]'} - {doctorCrm || '[CRM não configurado]'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

export default function IndicationsSettings({ customIndications, setCustomIndications, defaultIndications }) {
  const [newIndicationValue, setNewIndicationValue] = useState('');
  const [newIndicationLabel, setNewIndicationLabel] = useState('');
  const [newIndicationGroup, setNewIndicationGroup] = useState('Sintomas Dispépticos/Gerais');

  const allGroups = [
    'Sintomas Dispépticos/Gerais',
    'Esôfago / Refluxo',
    'Sangramento / Anemia',
    'Rastreamento e Controle',
    'Outras'
  ];

  const handleAddIndication = () => {
    if (!newIndicationValue.trim() || !newIndicationLabel.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    const newIndication = {
      value: newIndicationValue.trim(),
      label: newIndicationLabel.trim(),
      group: newIndicationGroup
    };

    setCustomIndications([...customIndications, newIndication]);
    setNewIndicationValue('');
    setNewIndicationLabel('');
  };

  const handleRemoveIndication = (index) => {
    const updated = customIndications.filter((_, i) => i !== index);
    setCustomIndications(updated);
  };

  const getTotalCount = () => {
    const defaultCount = defaultIndications.reduce((sum, group) => sum + group.options.length, 0);
    return defaultCount + customIndications.length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600" />
          Indicações Clínicas
        </CardTitle>
        <CardDescription>
          Adicione ou remova indicações clínicas personalizadas que aparecerão no formulário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-1">Sobre as Indicações</h4>
            <p className="text-xs text-amber-700">
              As indicações padrão do sistema não podem ser removidas. Você pode adicionar indicações customizadas que serão mescladas com as padrões.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Indicações Padrão</p>
            <p className="text-2xl font-bold text-slate-700">
              {defaultIndications.reduce((sum, group) => sum + group.options.length, 0)}
            </p>
          </div>
          <div className="bg-sky-50 p-4 rounded-lg border border-sky-200">
            <p className="text-xs text-sky-600 mb-1">Indicações Customizadas</p>
            <p className="text-2xl font-bold text-sky-700">{customIndications.length}</p>
          </div>
        </div>

        {/* Add New Indication */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Adicionar Nova Indicação</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ind-value" className="text-xs font-semibold text-slate-600">
                  Valor (ID Único)
                </Label>
                <Input
                  id="ind-value"
                  value={newIndicationValue}
                  onChange={(e) => setNewIndicationValue(e.target.value)}
                  placeholder="ex: Azia Crônica"
                  className="bg-white"
                />
                <p className="text-xs text-slate-500">Use um nome único e descritivo</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ind-label" className="text-xs font-semibold text-slate-600">
                  Rótulo (Exibido no Select)
                </Label>
                <Input
                  id="ind-label"
                  value={newIndicationLabel}
                  onChange={(e) => setNewIndicationLabel(e.target.value)}
                  placeholder="ex: Azia Crônica / Pirose Persistente"
                  className="bg-white"
                />
                <p className="text-xs text-slate-500">Texto que aparecerá na lista</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ind-group" className="text-xs font-semibold text-slate-600">
                Grupo (Categoria)
              </Label>
              <Select value={newIndicationGroup} onValueChange={setNewIndicationGroup}>
                <SelectTrigger id="ind-group" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddIndication} className="w-full bg-sky-600 hover:bg-sky-700 gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Indicação
            </Button>
          </div>
        </div>

        {/* Custom Indications List */}
        {customIndications.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Suas Indicações Customizadas</h3>
            <div className="space-y-2">
              {customIndications.map((indication, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
                        {indication.group}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm text-slate-800">{indication.label}</p>
                    <p className="text-xs text-slate-500">ID: {indication.value}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIndication(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {customIndications.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma indicação customizada adicionada ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
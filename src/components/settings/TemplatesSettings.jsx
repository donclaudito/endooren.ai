import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Copy, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Esôfago',
  'Estômago',
  'Duodeno',
  'Conclusão',
  'Observações',
  'Geral'
];

export default function TemplatesSettings({ customTemplates, setCustomTemplates }) {
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Esôfago');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleAddTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      alert('Por favor, preencha o nome e o conteúdo do template');
      return;
    }

    const newTemplate = {
      name: newTemplateName.trim(),
      category: newTemplateCategory,
      content: newTemplateContent.trim()
    };

    setCustomTemplates([...customTemplates, newTemplate]);
    setNewTemplateName('');
    setNewTemplateContent('');
  };

  const handleRemoveTemplate = (index) => {
    const updated = customTemplates.filter((_, i) => i !== index);
    setCustomTemplates(updated);
  };

  const handleCopyTemplate = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getTemplatesByCategory = (category) => {
    return customTemplates.filter(t => t.category === category);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-600" />
          Templates e Frases Predefinidas
        </CardTitle>
        <CardDescription>
          Crie templates reutilizáveis para achados comuns e conclusões que podem ser copiados rapidamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Como usar templates</h4>
            <p className="text-xs text-blue-700">
              Crie frases ou parágrafos que você usa com frequência. Durante o laudo, você pode copiar o template e colar onde necessário.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Total de Templates</p>
          <p className="text-2xl font-bold text-slate-700">{customTemplates.length}</p>
        </div>

        {/* Add New Template */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Criar Novo Template</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name" className="text-xs font-semibold text-slate-600">
                  Nome do Template
                </Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="ex: Esofagite Leve Padrão"
                  className="bg-white"
                />
                <p className="text-xs text-slate-500">Dê um nome descritivo</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-category" className="text-xs font-semibold text-slate-600">
                  Categoria
                </Label>
                <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                  <SelectTrigger id="template-category" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-content" className="text-xs font-semibold text-slate-600">
                Conteúdo do Template
              </Label>
              <Textarea
                id="template-content"
                value={newTemplateContent}
                onChange={(e) => setNewTemplateContent(e.target.value)}
                placeholder="Digite o texto do template aqui. Pode ser uma frase curta ou um parágrafo completo..."
                className="bg-white min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                Exemplo: "Mucosa esofágica com hiperemia leve no terço distal, sugestiva de esofagite de refluxo grau A de Los Angeles."
              </p>
            </div>
            <Button onClick={handleAddTemplate} className="w-full bg-sky-600 hover:bg-sky-700 gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Template
            </Button>
          </div>
        </div>

        {/* Templates List by Category */}
        {customTemplates.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Seus Templates</h3>
            {CATEGORIES.map((category) => {
              const templates = getTemplatesByCategory(category);
              if (templates.length === 0) return null;
              
              return (
                <div key={category}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-100">{category}</Badge>
                    <span className="text-slate-400">({templates.length})</span>
                  </h4>
                  <div className="space-y-2 ml-2">
                    {templates.map((template, globalIndex) => {
                      const actualIndex = customTemplates.indexOf(template);
                      return (
                        <div
                          key={actualIndex}
                          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm text-slate-800">{template.name}</h5>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyTemplate(template.content, actualIndex)}
                                className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                                title="Copiar conteúdo"
                              >
                                {copiedIndex === actualIndex ? (
                                  <span className="text-xs font-semibold">Copiado!</span>
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTemplate(actualIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded border border-slate-100">
                            <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap">
                              {template.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum template criado ainda</p>
            <p className="text-xs mt-1">Crie templates para agilizar seus laudos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
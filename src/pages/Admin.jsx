import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link, Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Key, 
  Brain, 
  Hammer, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle,
  Users, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    api_key: '',
    model_name: 'mistral-small-2506',
    active_skill_id: 'default',
    skills: []
  });

  // Local state for adding/editing a skill
  const [newSkillTitle, setNewSkillTitle] = useState('');
  const [newSkillPrompt, setNewSkillPrompt] = useState('');
  const [editingSkillId, setEditingSkillId] = useState(null);

  // Authentication gate
  if (!user || user.email !== 'clauorenstein@gmail.com') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchAdminConfig();
  }, []);

  const fetchAdminConfig = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/api/admin/settings');
      setConfig(data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar configurações",
        description: err.message || "Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (updatedConfig = config) => {
    setSaving(true);
    try {
      await apiClient.post('/api/admin/settings', updatedConfig);
      toast({
        title: "Sucesso",
        description: "Configurações globais salvas com sucesso!"
      });
      setConfig(updatedConfig);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: err.message || "Erro de conexão."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillTitle || !newSkillPrompt) return;

    const newSkill = {
      id: editingSkillId || 'skill_' + Date.now(),
      title: newSkillTitle,
      system_prompt: newSkillPrompt,
      is_active: false
    };

    let updatedSkills;
    if (editingSkillId) {
      // Editing existing
      updatedSkills = config.skills.map(s => s.id === editingSkillId ? { ...s, title: newSkillTitle, system_prompt: newSkillPrompt } : s);
      setEditingSkillId(null);
    } else {
      // Adding new
      updatedSkills = [...config.skills, newSkill];
    }

    const updatedConfig = {
      ...config,
      skills: updatedSkills
    };

    setNewSkillTitle('');
    setNewSkillPrompt('');
    handleSaveConfig(updatedConfig);
  };

  const handleActivateSkill = (skillId) => {
    const updatedSkills = config.skills.map(s => ({
      ...s,
      is_active: s.id === skillId
    }));
    
    const updatedConfig = {
      ...config,
      active_skill_id: skillId,
      skills: updatedSkills
    };
    handleSaveConfig(updatedConfig);
  };

  const handleDeleteSkill = (skillId) => {
    if (skillId === 'default') {
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "A diretriz padrão não pode ser excluída."
      });
      return;
    }

    const updatedSkills = config.skills.filter(s => s.id !== skillId);
    let activeId = config.active_skill_id;
    if (activeId === skillId) {
      activeId = 'default';
      // Mark default as active
      updatedSkills.forEach(s => {
        if (s.id === 'default') s.is_active = true;
      });
    }

    const updatedConfig = {
      ...config,
      active_skill_id: activeId,
      skills: updatedSkills
    };
    handleSaveConfig(updatedConfig);
  };

  const handleEditSkill = (skill) => {
    setEditingSkillId(skill.id);
    setNewSkillTitle(skill.title);
    setNewSkillPrompt(skill.system_prompt);
  };

  const createPageUrl = (pageName) => {
    return `/${pageName}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Hammer className="w-6 h-6 text-sky-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Painel Admin - Chamsa Suite</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-sky-400 bg-sky-950/40 border border-sky-900/50 px-3 py-1.5 rounded-lg">
          <span>Dr. Claudio (Admin)</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
          <p className="mt-4 text-slate-400 text-sm">Carregando painel administrativo...</p>
        </div>
      ) : (
        <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Global AI Config Form */}
          <div className="lg:col-span-1 bg-slate-950/40 border border-slate-800/80 rounded-xl p-6 shadow-xl flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Key className="w-5 h-5 text-sky-400" />
              <h2 className="font-bold text-white text-lg">Parâmetros Globais</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey" className="text-slate-300 text-sm font-medium mb-1.5 block">API Key Global</Label>
                <div className="relative">
                  <Input 
                    id="apiKey"
                    type="password"
                    placeholder="Cole a chave da API aqui..."
                    value={config.api_key}
                    onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-sky-500 pr-10"
                  />
                  <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Chave compartilhada para consultas de todos os médicos do laudo.</p>
              </div>

              <div>
                <Label htmlFor="modelName" className="text-slate-300 text-sm font-medium mb-1.5 block">Modelo Padrão</Label>
                <select 
                  id="modelName"
                  value={config.model_name}
                  onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 text-sm outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="mistral-small-2506">Mistral Small (mistral-small-2506)</option>
                  <option value="mistral-medium-latest">Mistral Medium (mistral-medium)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <Button 
                onClick={() => handleSaveConfig()} 
                disabled={saving}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm mt-4"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <SettingsIcon className="w-4 h-4 mr-2" />}
                Salvar Configurações
              </Button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/60 rounded-lg p-4 mt-auto">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Importante</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Mudanças neste painel impactam todos os médicos logados em tempo real ao utilizarem a análise de laudos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Skills List & Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Skills Form */}
            <form onSubmit={handleAddSkill} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
                <Brain className="w-5 h-5 text-sky-400" />
                <h2 className="font-bold text-white text-lg">
                  {editingSkillId ? 'Editar Diretriz (Skill)' : 'Nova Diretriz (Skill) Chamsa'}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="skillTitle" className="text-slate-300 text-sm font-medium mb-1.5 block">Título da Diretriz</Label>
                  <Input 
                    id="skillTitle"
                    placeholder="Ex: Análise Pediátrica, Diretrizes SOBED 2026..."
                    value={newSkillTitle}
                    onChange={(e) => setNewSkillTitle(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-sky-500"
                  />
                </div>

                <div>
                  <Label htmlFor="skillPrompt" className="text-slate-300 text-sm font-medium mb-1.5 block">System Prompt (Diretrizes Clínicas)</Label>
                  <Textarea 
                    id="skillPrompt"
                    rows={4}
                    placeholder="Instruções para a IA analisar o laudo..."
                    value={newSkillPrompt}
                    onChange={(e) => setNewSkillPrompt(e.target.value)}
                    required
                    className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-sky-500 font-sans text-xs"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  {editingSkillId && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        setEditingSkillId(null);
                        setNewSkillTitle('');
                        setNewSkillPrompt('');
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {editingSkillId ? 'Atualizar Diretriz' : 'Adicionar Diretriz'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Registered Skills Table */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-white text-sm">Diretrizes (Skills) Cadastradas</span>
                <span className="text-[10px] text-slate-500">{config.skills.length} diretrizes</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="p-4">Título</th>
                      <th className="p-4">Prompt</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {config.skills.map((skill) => (
                      <tr key={skill.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="p-4 font-bold text-white">{skill.title}</td>
                        <td className="p-4 text-slate-400 max-w-[200px] truncate" title={skill.system_prompt}>
                          {skill.system_prompt}
                        </td>
                        <td className="p-4 text-center">
                          {skill.id === config.active_skill_id || skill.is_active ? (
                            <span className="inline-flex items-center gap-1 bg-sky-950 text-sky-400 border border-sky-900 px-2 py-0.5 rounded-full font-bold">
                              <Check className="w-3 h-3" />
                              Ativa
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleActivateSkill(skill.id)}
                              className="text-slate-500 hover:text-sky-400 font-medium transition-colors"
                            >
                              Ativar
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            type="button"
                            onClick={() => handleEditSkill(skill)}
                            className="text-slate-400 hover:text-white font-medium"
                          >
                            Editar
                          </button>
                          {skill.id !== 'default' && (
                            <button 
                              type="button"
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="text-red-500 hover:text-red-400 font-medium inline-flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {config.skills.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                          Nenhuma diretriz cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

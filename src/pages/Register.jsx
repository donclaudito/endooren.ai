import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Mail, Lock, User, FileText, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [crm, setCrm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !crm.trim() || !email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas divergentes",
        description: "A confirmação de senha não coincide."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha deve conter pelo menos 6 caracteres."
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await signUp(email, password, {
        doctor_name: name,
        doctor_crm: crm
      });
      
      if (error) throw error;
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Por favor, verifique seu e-mail se necessário ou faça login."
      });
      navigate('/login');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: err.message || "Não foi possível realizar o cadastro."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50/50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sky-200 blur-3xl" />
        <div className="absolute -bottom-45 -left-40 w-96 h-96 rounded-full bg-indigo-200 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-slate-100 shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="mx-auto bg-sky-50 text-sky-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2 shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
              Criar Conta Médica
            </CardTitle>
            <CardDescription className="text-slate-500">
              Registre-se para começar a laudar com EndoOren.AI.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-slate-700">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr(a). Nome Sobrenome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="crm" className="text-slate-700">CRM (Conselho Regional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="crm"
                    type="text"
                    placeholder="CRM 123456-SP"
                    value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                    className="pl-10 border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-slate-700">E-mail Profissional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="medico@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-slate-700">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-slate-200 bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-slate-700">Confirmar</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 border-slate-200 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-md shadow-sky-100 transition-all py-6 rounded-lg text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Finalizar Cadastro"
                )}
              </Button>
              <div className="text-center text-sm text-slate-500">
                Já possui uma conta?{' '}
                <Link to="/login" className="text-sky-600 hover:text-sky-700 hover:underline font-semibold">
                  Entrar
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

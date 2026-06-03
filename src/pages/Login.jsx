import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha o e-mail e a senha."
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await login(email, password);
      if (error) throw error;
      
      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso."
      });
      navigate('/');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: err.message || "E-mail ou senha inválidos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50/50 flex items-center justify-center p-4">
      {/* Background patterns */}
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
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto bg-sky-50 text-sky-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2 shadow-inner">
              <Stethoscope className="w-6 h-6 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
              Acessar EndoOren.AI
            </CardTitle>
            <CardDescription className="text-slate-500">
              Digite seu e-mail e senha para gerenciar seus laudos.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700">Senha</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-sky-600 hover:text-sky-700 hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
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
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-md shadow-sky-100 transition-all py-6 rounded-lg text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
              <div className="text-center text-sm text-slate-500">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-sky-600 hover:text-sky-700 hover:underline font-semibold">
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, digite seu e-mail."
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await resetPassword(email);
      if (error) throw error;
      
      setIsSent(true);
      toast({
        title: "E-mail enviado!",
        description: "Enviamos um link de recuperação para o seu e-mail."
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: err.message || "Ocorreu um erro ao tentar recuperar a senha."
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
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto bg-sky-50 text-sky-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2 shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
              Recuperar Senha
            </CardTitle>
            <CardDescription className="text-slate-500">
              {isSent 
                ? "Confira a caixa de entrada do seu e-mail."
                : "Digite seu e-mail e enviaremos um link para redefinir sua senha."
              }
            </CardDescription>
          </CardHeader>
          
          {isSent ? (
            <CardContent className="space-y-4 text-center py-6">
              <div className="mx-auto text-emerald-500 bg-emerald-50 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-slate-600 text-sm">
                Se este e-mail estiver cadastrado no sistema, você receberá uma mensagem com instruções para redefinição.
              </p>
              <Link to="/login" className="block pt-4">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </Button>
              </Link>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">E-mail Cadastrado</Label>
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
                      Enviando link...
                    </>
                  ) : (
                    "Enviar Link de Recuperação"
                  )}
                </Button>
                <div className="text-center text-sm text-slate-500">
                  <Link to="/login" className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 hover:underline font-semibold">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Separator } from "./components/ui/separator";
import { Alert, AlertDescription } from "./components/ui/alert";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { Heart, Star, Trophy, Users, CheckCircle, Crown, Sparkles, Target, Gift, BookOpen, Award, Calendar, Download } from "lucide-react";
import { 
  TemperamentProfileCard, 
  SelfKnowledgeQuestionnaire, 
  WeeklyMissionsPanel, 
  EnhancedPremiumModal,
  PDFExportButton 
} from "./components/PremiumFeatures";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Login Component
const LoginDialog = ({ open, onOpenChange, onLogin }) => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, simulate login by finding user by email
      // In a real app, this would be a proper authentication endpoint
      const response = await axios.get(`${API}/users`);
      const users = response.data;
      const user = users.find(u => u.email === loginData.email);
      
      if (user) {
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userEmail', user.email);
        toast.success("Login realizado com sucesso!");
        onLogin(user.id);
        onOpenChange(false);
      } else {
        toast.error("Usuário não encontrado. Crie um perfil primeiro.");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Fazer Login
          </DialogTitle>
          <DialogDescription>
            Entre com suas credenciais para acessar seu perfil
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="login_email">Email</Label>
            <Input
              id="login_email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="login_password">Senha (deixe em branco)</Label>
            <Input
              id="login_password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              placeholder="Por enquanto, deixe vazio"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sistema de login simplificado - use apenas o email cadastrado
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Home Page Component
const Home = () => {
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (userId) => {
    window.location.href = `/dashboard/${userId}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1603309832178-2b8956de492f')"
          }}
        />
        <div className="relative bg-gradient-to-r from-rose-600/90 to-purple-600/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <Heart className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Temperamentos no
                <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                  Relacionamento
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Descubra a compatibilidade astrológica entre você e seu parceiro através da análise 
                dos temperamentos Cardinal, Fixo e Mutável. Fortaleça seu relacionamento com insights personalizados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setShowCreateProfile(true)}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 text-lg px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Começar Jornada
                </Button>
                <Button 
                  onClick={() => setShowLogin(true)}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 rounded-xl font-semibold shadow-xl transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Já tenho conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Um processo simples e envolvente para descobrir a magia do seu relacionamento
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Crie seu Perfil"
              description="Registre-se e informe seu signo e data de nascimento"
              image="https://images.unsplash.com/photo-1548126466-4470dfd3a209"
              badgeText="Primeira Conquista"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Questionário Personalizado"
              description="Responda perguntas sobre seu temperamento e personalidade"
              image="https://images.unsplash.com/photo-1519834785169-98be25ec3f84"
              badgeText="Autoconhecimento"
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Relatório de Compatibilidade"
              description="Receba análises detalhadas sobre seu relacionamento"
              image="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74"
              badgeText="Insights Premium"
            />
          </div>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="py-24 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sistema de Conquistas
            </h2>
            <p className="text-xl text-gray-600">
              Desbloqueie badges especiais conforme avança na sua jornada
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <BadgeCard
              icon={<Users className="h-6 w-6" />}
              title="Perfil Criado"
              description="Complete seu cadastro"
              color="bg-green-500"
            />
            <BadgeCard
              icon={<CheckCircle className="h-6 w-6" />}
              title="Questionário Completo"
              description="Finalize todas as perguntas"
              color="bg-blue-500"
            />
            <BadgeCard
              icon={<Star className="h-6 w-6" />}
              title="Relatório Gerado"
              description="Obtenha seu primeiro relatório"
              color="bg-purple-500"
            />
            <BadgeCard
              icon={<Heart className="h-6 w-6" />}
              title="Compartilhado"
              description="Compartilhe com seu parceiro"
              color="bg-pink-500"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-rose-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Crown className="h-16 w-16 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Descobrir o Poder do Seu Relacionamento?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de casais que já transformaram seus relacionamentos
          </p>
          <Button 
            onClick={() => setShowCreateProfile(true)}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-50 text-lg px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Gift className="mr-2 h-5 w-5" />
            Começar Agora - Grátis
          </Button>
        </div>
      </div>

      {/* Create Profile Dialog */}
      <CreateProfileDialog 
        open={showCreateProfile} 
        onOpenChange={setShowCreateProfile} 
      />

      {/* Login Dialog */}
      <LoginDialog 
        open={showLogin} 
        onOpenChange={setShowLogin}
        onLogin={handleLogin}
      />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, image, badgeText }) => (
  <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-0 bg-white">
    <div className="h-48 overflow-hidden">
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
    </div>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
          {icon}
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          {badgeText}
        </Badge>
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-gray-600 leading-relaxed">
        {description}
      </CardDescription>
    </CardContent>
  </Card>
);

// Badge Card Component
const BadgeCard = ({ icon, title, description, color }) => (
  <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
    <CardContent className="pt-6">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

// Create Profile Dialog Component
const CreateProfileDialog = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    zodiac_sign: "",
    birth_date: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const zodiacSigns = [
    { value: "aries", label: "Áries", dates: "21/03 - 19/04" },
    { value: "taurus", label: "Touro", dates: "20/04 - 20/05" },
    { value: "gemini", label: "Gêmeos", dates: "21/05 - 20/06" },
    { value: "cancer", label: "Câncer", dates: "21/06 - 22/07" },
    { value: "leo", label: "Leão", dates: "23/07 - 22/08" },
    { value: "virgo", label: "Virgem", dates: "23/08 - 22/09" },
    { value: "libra", label: "Libra", dates: "23/09 - 22/10" },
    { value: "scorpio", label: "Escorpião", dates: "23/10 - 21/11" },
    { value: "sagittarius", label: "Sagitário", dates: "22/11 - 21/12" },
    { value: "capricorn", label: "Capricórnio", dates: "22/12 - 19/01" },
    { value: "aquarius", label: "Aquário", dates: "20/01 - 18/02" },
    { value: "pisces", label: "Peixes", dates: "19/02 - 20/03" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.zodiac_sign || !formData.birth_date) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/users`, formData);
      toast.success("🎉 Perfil criado com sucesso! Primeira conquista desbloqueada!");
      onOpenChange(false);
      
      // Store user ID in localStorage for simple session management
      localStorage.setItem('userId', response.data.id);
      
      // Navigate to dashboard
      setTimeout(() => {
        window.location.href = `/dashboard/${response.data.id}`;
      }, 1000);
      
    } catch (error) {
      toast.error("Erro ao criar perfil. Tente novamente.");
      console.error("Error creating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Criar Seu Perfil
          </DialogTitle>
          <DialogDescription>
            Comece sua jornada de autoconhecimento astrológico
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Seu nome"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="zodiac_sign">Signo do Zodíaco</Label>
            <Select value={formData.zodiac_sign} onValueChange={(value) => setFormData({...formData, zodiac_sign: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu signo" />
              </SelectTrigger>
              <SelectContent>
                {zodiacSigns.map((sign) => (
                  <SelectItem key={sign.value} value={sign.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{sign.label}</span>
                      <span className="text-xs text-gray-500">{sign.dates}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Criando..." : "Criar Perfil"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Dashboard Component
const Dashboard = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  const [showSelfKnowledge, setShowSelfKnowledge] = useState(false);
  const [showTemperamentProfile, setShowTemperamentProfile] = useState(false);
  const [temperamentResult, setTemperamentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadQuestionnaire();
    loadTemperamentResult();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error loading user:", error);
      toast.error("Erro ao carregar dados do usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestionnaire = async () => {
    try {
      const response = await axios.get(`${API}/questionnaire`);
      setQuestionnaire(response.data);
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    }
  };

  const loadTemperamentResult = async () => {
    try {
      // Try to get the latest questionnaire result for this user
      // For now, we'll simulate this - in a real app, you'd have an API endpoint
      const mockResult = {
        dominant_modality: 'cardinal', // This would come from the actual result
        secondary_modality: 'fixed'
      };
      setTemperamentResult(mockResult);
    } catch (error) {
      console.error("Error loading temperament result:", error);
    }
  };

  const generateDemoCompatibilityReport = async () => {
    try {
      // Create a demo partner user
      const partnerData = {
        name: "Partner Demo",
        email: "partner@demo.com",
        zodiac_sign: "scorpio",
        birth_date: "1992-11-05"
      };
      
      const partnerResponse = await axios.post(`${API}/users`, partnerData);
      const partnerId = partnerResponse.data.id;
      
      // Submit questionnaire for partner (Fixed dominant)
      const partnerAnswers = [
        {"question_id": 1, "answer": "Penso bem e mantenho minha posição", "score": 3},
        {"question_id": 2, "answer": "Valoriza estabilidade e lealdade", "score": 3},
        {"question_id": 3, "answer": "Mantém sua posição com firmeza", "score": 3},
        {"question_id": 4, "answer": "Prefiro estabilidade e resisto a mudanças", "score": 3},
        {"question_id": 5, "answer": "Oferece suporte sólido e constante", "score": 3}
      ];
      
      await axios.post(`${API}/questionnaire/submit`, {
        user_id: partnerId,
        answers: partnerAnswers
      });
      
      // Generate compatibility report
      const compatibilityResponse = await axios.post(`${API}/compatibility`, {
        user1_id: userId,
        user2_id: partnerId
      });
      
      const report = compatibilityResponse.data;
      
      toast.success("🎉 Relatório de compatibilidade gerado! Nova conquista desbloqueada!");
      
      // Show enhanced report results
      const reportHtml = `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #7c3aed; text-align: center;">Relatório de Compatibilidade</h2>
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 48px; font-weight: bold; color: #059669;">${report.compatibility_score}%</div>
            <p style="color: #6b7280;">Score de Compatibilidade</p>
          </div>
          
          <h3 style="color: #059669; margin-top: 30px;">✅ Pontos Fortes:</h3>
          <ul>${report.strengths.map(s => `<li style="margin: 5px 0;">${s}</li>`).join('')}</ul>
          
          <h3 style="color: #dc2626; margin-top: 20px;">⚠️ Desafios:</h3>
          <ul>${report.challenges.map(c => `<li style="margin: 5px 0;">${c}</li>`).join('')}</ul>
          
          <h3 style="color: #7c3aed; margin-top: 20px;">💡 Recomendações:</h3>
          <ul>${report.recommendations.map(r => `<li style="margin: 5px 0;">${r}</li>`).join('')}</ul>
          
          ${user?.is_premium ? `
            <h3 style="color: #d97706; margin-top: 20px;">👑 Insights Premium:</h3>
            <ul>${report.premium_insights.map(i => `<li style="margin: 5px 0;">${i}</li>`).join('')}</ul>
          ` : `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <h4 style="color: #92400e;">🔒 Insights Premium Disponíveis</h4>
              <p style="color: #92400e; margin: 10px 0;">Desbloqueie análises mais profundas e estratégias personalizadas!</p>
            </div>
          `}
        </div>
      `;
      
      // Create a new window to show the report
      const reportWindow = window.open('', '_blank', 'width=800,height=600');
      reportWindow.document.write(`
        <html>
          <head><title>Relatório de Compatibilidade</title></head>
          <body>${reportHtml}</body>
        </html>
      `);
      reportWindow.document.close();
      
      // Reload user data to get updated badges
      loadUserData();
      
    } catch (error) {
      console.error("Error generating compatibility report:", error);
      toast.error("Erro ao gerar relatório. Tente novamente.");
    }
  };

  const handleShareWithPartner = async () => {
    try {
      await axios.post(`${API}/users/${userId}/share`);
      toast.success("🎉 Conquista desbloqueada: Compartilhou com parceiro!");
      
      // Copy link to clipboard
      const shareLink = `${window.location.origin}?ref=${userId}`;
      await navigator.clipboard.writeText(shareLink);
      toast.info("Link copiado para área de transferência!");
      
      // Reload user data to get updated badges
      loadUserData();
      
    } catch (error) {
      console.error("Error sharing with partner:", error);
      toast.error("Erro ao compartilhar. Tente novamente.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>Carregando...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                Bem-vindo ao seu painel de temperamentos
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">Progresso da Jornada</span>
                {user?.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <Progress value={user?.progress_percentage || 0} className="w-32" />
              <p className="text-sm text-gray-500 mt-1">
                {user?.progress_percentage || 0}% concluído
              </p>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <BadgesSection user={user} />

        {/* Actions Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ActionCard
            icon={<Target className="h-8 w-8" />}
            title="Questionário de Temperamento"
            description="Descubra seu perfil Cardinal, Fixo ou Mutável"
            buttonText="Iniciar Questionário"
            onClick={() => setShowQuestionnaire(true)}
            completed={user?.badges?.includes('questionnaire_completed')}
          />
          
          <ActionCard
            icon={<Heart className="h-8 w-8" />}
            title="Análise de Compatibilidade"
            description="Compare temperamentos com seu parceiro"
            buttonText="Gerar Relatório"
            onClick={() => {
              if (!user?.badges?.includes('questionnaire_completed')) {
                toast.info("Complete o questionário primeiro!");
              } else {
                generateDemoCompatibilityReport();
              }
            }}
            disabled={!user?.badges?.includes('questionnaire_completed')}
          />
          
          <ActionCard
            icon={<Users className="h-8 w-8" />}
            title="Compartilhar com Parceiro"
            description="Convide seu parceiro para descobrir a compatibilidade"
            buttonText="Compartilhar"
            onClick={handleShareWithPartner}
            disabled={!user?.badges?.includes('report_generated')}
          />
        </div>

        {/* Premium Features Section */}
        {user?.is_premium && (
          <div className="space-y-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Recursos Premium</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ActionCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Perfil Detalhado de Temperamento"
                description="Análise completa do seu temperamento com dicas personalizadas"
                buttonText="Ver Perfil Detalhado"
                onClick={() => setShowTemperamentProfile(true)}
                completed={temperamentResult !== null}
                isPremium={true}
              />
              
              <ActionCard
                icon={<Star className="h-8 w-8" />}
                title="Questionário de Autoconhecimento"
                description="Descubra insights profundos sobre sua personalidade"
                buttonText="Iniciar Autoconhecimento"
                onClick={() => setShowSelfKnowledge(true)}
                isPremium={true}
              />
            </div>

            {/* Weekly Missions Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <WeeklyMissionsPanel userId={userId} />
            </div>
          </div>
        )}

        {/* Temperament Profile Preview for Free Users */}
        {!user?.is_premium && temperamentResult && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Seu Perfil de Temperamento</h2>
              <Badge className="bg-yellow-100 text-yellow-800">Preview</Badge>
            </div>
            <TemperamentProfileCard 
              modality={temperamentResult.dominant_modality} 
              isPreview={true}
            />
          </div>
        )}

        {/* Premium Upgrade Card */}
        {!user?.is_premium && (
          <PremiumUpgradeCard onUpgrade={() => setShowPremiumUpgrade(true)} />
        )}

        {/* Questionnaire Dialog */}
        {questionnaire && (
          <QuestionnaireDialog
            open={showQuestionnaire}
            onOpenChange={setShowQuestionnaire}
            questionnaire={questionnaire}
            userId={userId}
            onComplete={loadUserData}
          />
        )}

        {/* Premium Modals */}
        <EnhancedPremiumModal
          open={showPremiumUpgrade}
          onOpenChange={setShowPremiumUpgrade}
          userId={userId}
        />

        {/* Self Knowledge Questionnaire Modal */}
        {showSelfKnowledge && (
          <Dialog open={showSelfKnowledge} onOpenChange={setShowSelfKnowledge}>
            <DialogContent className="sm:max-w-4xl">
              <SelfKnowledgeQuestionnaire 
                userId={userId} 
                onComplete={(result) => {
                  setShowSelfKnowledge(false);
                  toast.success("Insights de autoconhecimento desbloqueados!");
                  loadUserData();
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Temperament Profile Modal */}
        {showTemperamentProfile && temperamentResult && (
          <Dialog open={showTemperamentProfile} onOpenChange={setShowTemperamentProfile}>
            <DialogContent className="sm:max-w-4xl">
              <TemperamentProfileCard 
                modality={temperamentResult.dominant_modality} 
                isPreview={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

// Badges Section Component
const BadgesSection = ({ user }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Suas Conquistas</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <BadgeItem
        icon={<Users className="h-6 w-6" />}
        title="Perfil Criado"
        earned={user?.badges?.includes('profile_created')}
        color="bg-green-500"
      />
      <BadgeItem
        icon={<CheckCircle className="h-6 w-6" />}
        title="Questionário Completo"
        earned={user?.badges?.includes('questionnaire_completed')}
        color="bg-blue-500"
      />
      <BadgeItem
        icon={<Star className="h-6 w-6" />}
        title="Relatório Gerado"
        earned={user?.badges?.includes('report_generated')}
        color="bg-purple-500"
      />
      <BadgeItem
        icon={<Heart className="h-6 w-6" />}
        title="Compartilhado"
        earned={user?.badges?.includes('shared_with_partner')}
        color="bg-pink-500"
      />
    </div>
  </div>
);

// Badge Item Component
const BadgeItem = ({ icon, title, earned, color }) => (
  <div className={`p-4 rounded-xl text-center transition-all duration-300 ${
    earned ? 'bg-gray-50 shadow-lg' : 'bg-gray-100 opacity-50'
  }`}>
    <div className={`w-12 h-12 ${earned ? color : 'bg-gray-400'} rounded-full flex items-center justify-center text-white mx-auto mb-2`}>
      {icon}
    </div>
    <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
    {earned && <Badge className="mt-2 bg-green-100 text-green-800">Conquistado!</Badge>}
  </div>
);

// Action Card Component
const ActionCard = ({ icon, title, description, buttonText, onClick, completed, disabled, isPremium }) => (
  <Card className={`hover:shadow-xl transition-all duration-300 border-0 ${
    isPremium ? 'bg-gradient-to-br from-yellow-50 to-purple-50 border-2 border-yellow-200' : 'bg-white'
  }`}>
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${isPremium ? 'bg-yellow-100 text-yellow-600' : 'bg-purple-100 text-purple-600'}`}>
          {icon}
        </div>
        {isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
        {completed && <Badge className="bg-green-100 text-green-800">Concluído</Badge>}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="text-gray-600 leading-relaxed">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button 
        onClick={onClick}
        disabled={disabled}
        className={`w-full disabled:opacity-50 ${
          isPremium 
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' 
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {buttonText}
      </Button>
    </CardContent>
  </Card>
);

// Premium Upgrade Card Component
const PremiumUpgradeCard = ({ onUpgrade }) => (
  <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-300">
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <Crown className="h-8 w-8 text-yellow-600" />
        <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
      </div>
      <CardTitle className="text-2xl text-gray-900">Upgrade para Premium</CardTitle>
      <CardDescription className="text-gray-700 text-lg">
        Desbloqueie estratégias personalizadas, guias de comunicação detalhados e exercícios exclusivos para fortalecer ainda mais seu relacionamento.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">R$ 12</p>
          <p className="text-sm text-gray-600">Pagamento único</p>
        </div>
        <Button 
          onClick={onUpgrade}
          size="lg"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6"
        >
          Fazer Upgrade
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Questionnaire Dialog Component
const QuestionnaireDialog = ({ open, onOpenChange, questionnaire, userId, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = questionnaire.questions || [];

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      toast.error("Por favor, selecione uma resposta");
      return;
    }

    const question = questions[currentQuestion];
    const selectedOption = question.options.find(opt => opt.answer === selectedAnswer);
    
    const newAnswer = {
      question_id: question.id,
      answer: selectedAnswer,
      score: selectedOption?.score || 0
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      submitQuestionnaire(newAnswers);
    }
  };

  const submitQuestionnaire = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API}/questionnaire/submit`, {
        user_id: userId,
        answers: finalAnswers
      });
      
      toast.success("🎉 Questionário concluído! Nova conquista desbloqueada!");
      onOpenChange(false);
      onComplete();
      
      // Reset state
      setCurrentQuestion(0);
      setAnswers([]);
      setSelectedAnswer("");
    } catch (error) {
      toast.error("Erro ao submeter questionário");
      console.error("Error submitting questionnaire:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!questions.length) return null;

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Questionário de Temperamento
          </DialogTitle>
          <DialogDescription>
            Pergunta {currentQuestion + 1} de {questions.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Progress value={progress} className="w-full" />
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {question.question}
            </h3>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={option.answer} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option.answer}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                  setSelectedAnswer(answers[currentQuestion - 1]?.answer || "");
                }
              }}
              disabled={currentQuestion === 0}
            >
              Anterior
            </Button>
            
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Enviando..." : 
               currentQuestion === questions.length - 1 ? "Finalizar" : "Próxima"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};



// Payment Success Component
const PaymentSuccess = () => {
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const getUrlParameter = (name) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  const checkPaymentStatus = async () => {
    const sessionId = getUrlParameter('session_id');
    if (!sessionId) {
      setPaymentStatus('error');
      setIsCheckingPayment(false);
      return;
    }

    try {
      // Poll payment status
      let attempts = 0;
      const maxAttempts = 5;
      
      const pollStatus = async () => {
        const response = await axios.get(`${API}/payments/checkout/status/${sessionId}`);
        const data = response.data;
        
        if (data.payment_status === 'paid') {
          setPaymentStatus('success');
          setIsCheckingPayment(false);
          toast.success("🎉 Pagamento realizado com sucesso! Bem-vindo ao Premium!");
          return;
        } else if (data.status === 'expired') {
          setPaymentStatus('expired');
          setIsCheckingPayment(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollStatus, 2000);
        } else {
          setPaymentStatus('timeout');
          setIsCheckingPayment(false);
        }
      };
      
      pollStatus();
      
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
      setIsCheckingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8">
        <Card className="text-center">
          <CardContent className="pt-6">
            {isCheckingPayment && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">Verificando pagamento...</h2>
                <p className="text-gray-600">Aguarde enquanto confirmamos sua transação.</p>
              </>
            )}
            
            {paymentStatus === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">Pagamento Confirmado!</h2>
                <p className="text-gray-600 mb-6">
                  Parabéns! Você agora tem acesso ao Premium com insights exclusivos.
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Voltar ao App
                </Button>
              </>
            )}
            
            {paymentStatus === 'error' && (
              <>
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h2 className="text-xl font-semibold text-red-600 mb-2">Erro no Pagamento</h2>
                <p className="text-gray-600 mb-6">
                  Ocorreu um erro ao processar seu pagamento. Tente novamente.
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Voltar ao App
                </Button>
              </>
            )}
            
            {(paymentStatus === 'expired' || paymentStatus === 'timeout') && (
              <>
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h2 className="text-xl font-semibold text-yellow-600 mb-2">Sessão Expirada</h2>
                <p className="text-gray-600 mb-6">
                  A sessão de pagamento expirou. Por favor, tente novamente.
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Voltar ao App
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    // Also listen for programmatic navigation
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    
    // Check for changes periodically as a fallback
    const intervalId = setInterval(handlePathChange, 100);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(intervalId);
    };
  }, []);

  // Simple routing logic
  const dashboardMatch = currentPath.match(/^\/dashboard\/(.+)$/);
  const userId = dashboardMatch ? dashboardMatch[1] : null;

  if (userId) {
    return (
      <>
        <Dashboard userId={userId} />
        <Toaster />
      </>
    );
  }

  if (currentPath === '/premium/success' || currentPath.includes('/premium/success')) {
    return (
      <>
        <PaymentSuccess />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Home />
      <Toaster />
    </>
  );
}

export default App;
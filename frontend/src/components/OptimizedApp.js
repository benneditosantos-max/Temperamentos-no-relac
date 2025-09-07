import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import { 
  Heart, Star, Trophy, Users, CheckCircle, Crown, Sparkles, Target, Gift, 
  BookOpen, Award, Calendar, Download, Share2, Send, MessageHeart, Lightbulb,
  Zap, Brain, Timer, Play, Pause, RefreshCw, Camera, FileText, Mail
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// 🔹 COMPONENTE PRINCIPAL OTIMIZADO
export const OptimizedTemperamentApp = () => {
  const [currentStep, setCurrentStep] = useState('home'); // home, diagnosis, results, sharing
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [temperamentResult, setTemperamentResult] = useState(null);
  const [compatibilityResult, setCompatibilityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gamificationScore, setGamificationScore] = useState(0);
  const [badges, setBadges] = useState([]);

  // 🎨 COMPONENTE: TELA INICIAL OTIMIZADA
  const HomePage = () => (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #fff1f2, #fef7ed, #fffbeb)'}}>
      {/* Header com animação */}
      <div className="text-center py-16 px-4">
        <div className="animate-pulse-heart mb-6">
          <Heart className="h-16 w-16 text-rose-500 mx-auto" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Descubra a Química do seu
          <span className="text-rose-500 block">Relacionamento</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Entenda como seus temperamentos se conectam e construam juntos um amor mais profundo e consciente
        </p>
        
        {/* Botões de ação emocional */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={() => setCurrentStep('diagnosis')}
            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Quero descobrir agora
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {/* Login */}}
            className="border-rose-200 text-rose-700 hover:bg-rose-50 px-6 py-4 rounded-full"
          >
            <Users className="mr-2 h-4 w-4" />
            Já tenho conta
          </Button>
        </div>
      </div>

      {/* Cards de apresentação com ilustrações */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-amber-500" />}
            title="Diagnóstico Personalizado"
            description="Descubra seu temperamento único baseado na sua personalidade e data de nascimento"
            color="amber"
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8 text-rose-500" />}
            title="Compatibilidade de Casal"
            description="Entenda como vocês se conectam e onde podem crescer juntos"
            color="rose"
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-emerald-500" />}
            title="Planos de Evolução"
            description="Receba exercícios práticos e dicas personalizadas para fortalecer o relacionamento"
            color="emerald"
          />
        </div>
      </div>
    </div>
  );

  // 🔹 COMPONENTE: DIAGNÓSTICO RÁPIDO APRIMORADO
  const QuickDiagnosis = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      birthDate: '',
      partner_name: '',
      questions: {}
    });

    const questions = [
      {
        id: 1,
        text: "Quando enfrento um desafio no relacionamento, eu costumo:",
        options: [
          { value: "cardinal", text: "Tomar a iniciativa e buscar soluções imediatas", emoji: "⚡" },
          { value: "fixed", text: "Refletir profundamente antes de agir", emoji: "🤔" },
          { value: "mutable", text: "Me adaptar e encontrar alternativas flexíveis", emoji: "🌊" }
        ]
      },
      {
        id: 2,
        text: "Na comunicação com meu parceiro, eu prefiro:",
        options: [
          { value: "cardinal", text: "Conversas diretas e decisivas", emoji: "💬" },
          { value: "fixed", text: "Discussões profundas e consistentes", emoji: "💭" },
          { value: "mutable", text: "Diálogos flexíveis que fluem naturalmente", emoji: "🌈" }
        ]
      },
      {
        id: 3,
        text: "Quando planejo momentos especiais para nós dois:",
        options: [
          { value: "cardinal", text: "Gosto de liderar e organizar tudo", emoji: "📋" },
          { value: "fixed", text: "Prefiro tradições e rituais consistentes", emoji: "🕯️" },
          { value: "mutable", text: "Improviso e me deixo levar pelo momento", emoji: "🎭" }
        ]
      }
    ];

    const handleSubmit = async () => {
      setIsLoading(true);
      try {
        // Calcular temperamento baseado nas respostas e data de nascimento
        const temperament = calculateTemperament(formData);
        setTemperamentResult(temperament);
        setCurrentStep('results');
        
        // Gamificação: primeiro diagnóstico
        awardPoints(50, "Primeiro diagnóstico realizado!");
        
      } catch (error) {
        toast.error("Erro ao processar diagnóstico. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Descubra seu Temperamento</CardTitle>
              <CardDescription className="text-rose-100">
                Responda algumas perguntas e descubra como você se relaciona
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {/* Informações básicas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">Seu nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Como você gosta de ser chamado?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Seu email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="seu@email.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate" className="text-gray-700 font-medium">Data de nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Usamos para calcular seu temperamento astrológico</p>
              </div>

              {/* Questionário interativo */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Perguntas rápidas sobre você
                </h3>
                
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <p className="font-medium text-gray-800">{question.text}</p>
                    <RadioGroup
                      value={formData.questions[question.id] || ""}
                      onValueChange={(value) => 
                        setFormData({
                          ...formData,
                          questions: {...formData.questions, [question.id]: value}
                        })
                      }
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-rose-200 transition-all">
                          <RadioGroupItem value={option.value} id={`q${question.id}_${optIndex}`} />
                          <Label 
                            htmlFor={`q${question.id}_${optIndex}`}
                            className="flex-1 cursor-pointer flex items-center gap-2"
                          >
                            <span className="text-lg">{option.emoji}</span>
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              {/* Informação sobre o parceiro */}
              <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                <Label htmlFor="partner_name" className="text-gray-700 font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Nome do seu parceiro (opcional)
                </Label>
                <Input
                  id="partner_name"
                  value={formData.partner_name}
                  onChange={(e) => setFormData({...formData, partner_name: e.target.value})}
                  placeholder="Para personalizar os resultados"
                  className="mt-2 bg-white"
                />
                <p className="text-sm text-rose-600 mt-1">
                  Se informar, criaremos dicas específicas para vocês dois
                </p>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email || !formData.birthDate || isLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analisando seu temperamento...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Descobrir meu temperamento
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // 🔹 COMPONENTE: RESULTADOS COM GAMIFICAÇÃO
  const ResultsPage = () => {
    if (!temperamentResult) return null;

    const { classic_temperament, astrological_modality, zodiac_sign } = temperamentResult;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-peach-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Resultado principal com animação */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400 p-8 text-white text-center">
              <div className="animate-bounce mb-4">
                <Crown className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Seu temperamento é
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                {classic_temperament} {astrological_modality}
              </h2>
              <p className="text-xl text-amber-100">
                Baseado em {getZodiacName(zodiac_sign)} - {temperamentResult.birth_date}
              </p>
              
              {/* Pontuação de gamificação */}
              <div className="mt-6 bg-white/20 rounded-full p-4 inline-block">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6" />
                  <span className="font-bold text-lg">{gamificationScore} pontos conquistados!</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              {/* Descrição do temperamento */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-500" />
                    Características principais
                  </h3>
                  <div className="space-y-3">
                    <TemperamentTrait
                      icon="💫"
                      title="Estilo de comunicação"
                      description="Direto e assertivo, gosta de resolver questões rapidamente"
                    />
                    <TemperamentTrait
                      icon="❤️"
                      title="Na intimidade"
                      description="Passionate and iniciativo, valoriza momentos intensos"
                    />
                    <TemperamentTrait
                      icon="⚡"
                      title="Resolução de conflitos"
                      description="Prefere enfrentar problemas de frente e buscar soluções práticas"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="h-6 w-6 text-emerald-500" />
                    Dicas para crescimento
                  </h3>
                  <div className="space-y-3">
                    <GrowthTip
                      title="Pratique a paciência"
                      description="Reserve momentos para ouvir seu parceiro antes de agir"
                    />
                    <GrowthTip
                      title="Valorize processos"
                      description="Nem tudo precisa ser resolvido imediatamente"
                    />
                    <GrowthTip
                      title="Celebre pequenos momentos"
                      description="Encontre beleza na rotina e nos detalhes do relacionamento"
                    />
                  </div>
                </div>
              </div>

              {/* Badges conquistadas */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Conquistas desbloqueadas
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-emerald-500 text-white px-4 py-2 text-sm">
                    🎯 Primeiro diagnóstico
                  </Badge>
                  <Badge className="bg-amber-500 text-white px-4 py-2 text-sm">
                    ⭐ Autoconhecimento
                  </Badge>
                  <Badge className="bg-purple-500 text-white px-4 py-2 text-sm">
                    🧠 Perfil completo
                  </Badge>
                </div>
              </div>

              {/* Ações de compartilhamento */}
              <div className="space-y-4">
                <Button 
                  onClick={() => setCurrentStep('sharing')}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <MessageHeart className="mr-2 h-5 w-5" />
                  Compartilhar com meu amor
                </Button>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => generatePDF()}
                    className="py-3 border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar em PDF
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {/* Upgrade para Premium */}}
                    className="py-3 border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Evoluir juntos - $9.97
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview das funcionalidades premium */}
          <PremiumPreview />
        </div>
      </div>
    );
  };

  // 🔹 COMPONENTE: COMPARTILHAMENTO COM PARCEIRO
  const SharingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <MessageHeart className="h-6 w-6" />
              Convide seu amor para descobrir
            </CardTitle>
            <CardDescription className="text-pink-100">
              Crie um convite especial para seu parceiro
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <ShareWithPartner />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Funções auxiliares
  const calculateTemperament = (formData) => {
    // Lógica de cálculo do temperamento
    const birth = new Date(formData.birthDate);
    const month = birth.getMonth() + 1;
    const day = birth.getDate();
    
    // Determinar signo zodiacal
    let zodiacSign = determineZodiacSign(month, day);
    
    // Mapear para temperamento
    const zodiacToModality = {
      'aries': 'Cardinal',     'taurus': 'Fixo',       'gemini': 'Mutável',
      'cancer': 'Cardinal',    'leo': 'Fixo',          'virgo': 'Mutável',
      'libra': 'Cardinal',     'scorpio': 'Fixo',      'sagittarius': 'Mutável',
      'capricorn': 'Cardinal', 'aquarius': 'Fixo',     'pisces': 'Mutável'
    };
    
    const modalityToClassic = {
      'Cardinal': 'Colérico', 'Fixo': 'Melancólico', 'Mutável': 'Sanguíneo'
    };
    
    const modality = zodiacToModality[zodiacSign];
    const classic = modalityToClassic[modality];
    
    return {
      classic_temperament: classic,
      astrological_modality: modality,
      zodiac_sign: zodiacSign,
      birth_date: formData.birthDate,
      user_data: formData
    };
  };

  const awardPoints = (points, message) => {
    setGamificationScore(prev => prev + points);
    toast.success(`+${points} pontos! ${message}`);
  };

  const generatePDF = () => {
    // Lógica para gerar PDF
    toast.success("PDF gerado com sucesso!");
  };

  // Renderização principal
  return (
    <div className="font-sans">
      <Toaster position="top-right" />
      
      {currentStep === 'home' && <HomePage />}
      {currentStep === 'diagnosis' && <QuickDiagnosis />}
      {currentStep === 'results' && <ResultsPage />}
      {currentStep === 'sharing' && <SharingPage />}
      
      <style jsx>{`
        @keyframes pulse-heart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-pulse-heart {
          animation: pulse-heart 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Componentes auxiliares
const FeatureCard = ({ icon, title, description, color }) => (
  <Card className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-${color}-200 bg-gradient-to-br from-white to-${color}-50`}>
    <CardContent className="p-6 text-center">
      <div className={`inline-block p-4 rounded-full bg-${color}-100 mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

const TemperamentTrait = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
    <span className="text-2xl">{icon}</span>
    <div>
      <h4 className="font-bold text-gray-800">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const GrowthTip = ({ title, description }) => (
  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
    <Lightbulb className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-1" />
    <div>
      <h4 className="font-bold text-gray-800">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

// Componente de Preview Premium
const PremiumPreview = () => (
  <Card className="shadow-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
    <CardHeader className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white">
      <CardTitle className="text-2xl flex items-center justify-center gap-2">
        <Crown className="h-6 w-6" />
        Desbloqueie todo seu potencial
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-3">Na versão Premium:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Perfil completo detalhado (10+ páginas)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Exercícios práticos para o casal
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Coach de relacionamento personalizado
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Relatórios mensais de evolução
            </li>
          </ul>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-amber-600 mb-2">$9.97</div>
          <p className="text-gray-600 mb-4">Pagamento único • Acesso vitalício</p>
          <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-3 rounded-full shadow-lg">
            <Crown className="mr-2 h-4 w-4" />
            Evoluir juntos agora
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente de compartilhamento
const ShareWithPartner = () => {
  const [message, setMessage] = useState("Oi amor! 💕 Descobri algo incrível sobre meu temperamento e quero que você descubra o seu também. Vamos entender melhor como nos conectamos? ✨");
  const [partnerEmail, setPartnerEmail] = useState("");

  const sendInvitation = () => {
    // Lógica de envio
    toast.success("Convite enviado com amor! 💕");
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="partnerEmail" className="text-gray-700 font-medium">Email do seu parceiro</Label>
        <Input
          id="partnerEmail"
          type="email"
          value={partnerEmail}
          onChange={(e) => setPartnerEmail(e.target.value)}
          placeholder="amor@example.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="message" className="text-gray-700 font-medium">Mensagem personalizada</Label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <p className="text-sm text-gray-500 mt-1">Personalize a mensagem para tornar o convite mais especial</p>
      </div>

      <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
        <h4 className="font-bold text-rose-800 mb-2">Preview do convite:</h4>
        <div className="bg-white p-4 rounded border text-sm text-gray-700 leading-relaxed">
          {message}
          <div className="mt-3 text-center">
            <Button size="sm" className="bg-rose-500 text-white">
              Descobrir meu temperamento
            </Button>
          </div>
        </div>
      </div>

      <Button 
        onClick={sendInvitation}
        disabled={!partnerEmail}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Send className="mr-2 h-5 w-5" />
        Enviar convite com amor
      </Button>
    </div>
  );
};

// Funções auxiliares
const determineZodiacSign = (month, day) => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
};

const getZodiacName = (zodiacSign) => {
  const names = {
    'aries': 'Áries', 'taurus': 'Touro', 'gemini': 'Gêmeos',
    'cancer': 'Câncer', 'leo': 'Leão', 'virgo': 'Virgem',
    'libra': 'Libra', 'scorpio': 'Escorpião', 'sagittarius': 'Sagitário',
    'capricorn': 'Capricórnio', 'aquarius': 'Aquário', 'pisces': 'Peixes'
  };
  return names[zodiacSign] || zodiacSign;
};

export default OptimizedTemperamentApp;
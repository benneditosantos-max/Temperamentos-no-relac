import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import { 
  Heart, Trophy, Users, CheckCircle, Crown, Sparkles, Target, 
  Award, Download, Send, MessageCircleHeart, Lightbulb,
  Brain, RefreshCw
} from "lucide-react";
import ShareWithPartnerModal from "./ShareWithPartner";

export const CleanOptimizedTemperamentApp = () => {
  const [currentStep, setCurrentStep] = useState('home');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    partner_name: '',
    questions: {}
  });
  const [temperamentResult, setTemperamentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gamificationScore, setGamificationScore] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [compatibilityData, setCompatibilityData] = useState(null);

  const calculateTemperament = (data) => {
    const birth = new Date(data.birthDate);
    const month = birth.getMonth() + 1;
    const day = birth.getDate();
    
    let zodiacSign = 'aries';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacSign = 'leo';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiacSign = 'sagittarius';
    
    const zodiacToModality = {
      'aries': 'Cardinal', 'leo': 'Fixo', 'sagittarius': 'Mutável'
    };
    
    const modalityToClassic = {
      'Cardinal': 'Colérico', 'Fixo': 'Melancólico', 'Mutável': 'Sanguíneo'
    };
    
    const modality = zodiacToModality[zodiacSign] || 'Cardinal';
    const classic = modalityToClassic[modality];
    
    return {
      classic_temperament: classic,
      astrological_modality: modality,
      zodiac_sign: zodiacSign,
      birth_date: data.birthDate
    };
  };

  const getZodiacName = (sign) => {
    const names = { 'aries': 'Áries', 'leo': 'Leão', 'sagittarius': 'Sagitário' };
    return names[sign] || sign;
  };

  // Função para simular dados de compatibilidade
  const generateCompatibilityData = (userResult, partnerName = "Seu Parceiro") => {
    const partnerTemperaments = ['Colérico', 'Melancólico', 'Sanguíneo', 'Fleumático'];
    const randomPartner = partnerTemperaments[Math.floor(Math.random() * partnerTemperaments.length)];
    
    // Calcula score baseado na compatibilidade dos temperamentos
    const compatibilityMatrix = {
      'Colérico': { 'Colérico': 65, 'Melancólico': 78, 'Sanguíneo': 85, 'Fleumático': 72 },
      'Melancólico': { 'Colérico': 78, 'Melancólico': 70, 'Sanguíneo': 68, 'Fleumático': 82 },
      'Sanguíneo': { 'Colérico': 85, 'Melancólico': 68, 'Sanguíneo': 75, 'Fleumático': 79 },
      'Fleumático': { 'Colérico': 72, 'Melancólico': 82, 'Sanguíneo': 79, 'Fleumático': 71 }
    };

    const userTemp = userResult?.temperament || 'Colérico';
    const score = compatibilityMatrix[userTemp]?.[randomPartner] || 75;

    return {
      userTemperament: userTemp,
      partnerTemperament: randomPartner,
      partnerName: partnerName,
      score: score,
      insights: {
        strengths: "Comunicação natural e objetivos compartilhados",
        challenges: "Diferentes ritmos de vida e tomada de decisão",
        suggestions: "Pratiquem momentos de qualidade sem distrações externas"
      }
    };
  };

  const handleShareWithPartner = () => {
    if (!temperamentResult) {
      toast.error("Complete o diagnóstico primeiro para compartilhar!");
      return;
    }

    const compatibility = generateCompatibilityData(
      temperamentResult, 
      formData.partner_name || "Seu Parceiro"
    );
    
    setCompatibilityData(compatibility);
    setShowShareModal(true);
  };

  if (currentStep === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <Toaster position="top-right" />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="mb-6">
              <Heart className="h-16 w-16 text-rose-500 mx-auto animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Descubra a Química do seu
              <span className="text-rose-500 block">Relacionamento</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Entenda como seus temperamentos se conectam e construam juntos um amor mais profundo e consciente
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                onClick={() => setCurrentStep('diagnosis')}
                className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 text-lg rounded-full shadow-lg"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Quero descobrir agora
              </Button>
              
              <Button 
                variant="outline"
                className="border-rose-200 text-rose-700 hover:bg-rose-50 px-6 py-4 rounded-full"
                size="lg"
              >
                <Users className="mr-2 h-4 w-4" />
                Já tenho conta
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 border-amber-200">
              <CardContent className="p-6 text-center">
                <div className="inline-block p-4 rounded-full bg-amber-100 mb-4">
                  <Brain className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Diagnóstico Personalizado</h3>
                <p className="text-gray-600">Descubra seu temperamento único baseado na sua personalidade</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-rose-200">
              <CardContent className="p-6 text-center">
                <div className="inline-block p-4 rounded-full bg-rose-100 mb-4">
                  <Heart className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Compatibilidade de Casal</h3>
                <p className="text-gray-600">Entenda como vocês se conectam e onde podem crescer juntos</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-emerald-200">
              <CardContent className="p-6 text-center">
                <div className="inline-block p-4 rounded-full bg-emerald-100 mb-4">
                  <Target className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Planos de Evolução</h3>
                <p className="text-gray-600">Receba exercícios práticos e dicas personalizadas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'diagnosis') {
    const questions = [
      {
        id: 1,
        text: "Quando enfrento um desafio no relacionamento, eu costumo:",
        options: [
          { value: "cardinal", text: "Tomar a iniciativa imediata", emoji: "⚡" },
          { value: "fixed", text: "Refletir antes de agir", emoji: "🤔" },
          { value: "mutable", text: "Me adaptar flexivelmente", emoji: "🌊" }
        ]
      }
    ];

    const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.birthDate) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      setIsLoading(true);
      try {
        const result = calculateTemperament(formData);
        setTemperamentResult(result);
        setCurrentStep('results');
        setGamificationScore(50);
        toast.success("Parabéns! +50 pontos conquistados!");
      } catch (error) {
        toast.error("Erro ao processar. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 py-8 px-4">
        <Toaster position="top-right" />
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Descubra seu Temperamento</CardTitle>
              <CardDescription className="text-rose-100">
                Responda algumas perguntas e descubra como você se relaciona
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Seu nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Como você gosta de ser chamado?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Seu email *</Label>
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
                <Label htmlFor="birthDate">Data de nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Pergunta rápida sobre você
                </h3>
                
                {questions.map((question) => (
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
                        <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border hover:border-rose-200 transition-all">
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

              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 text-lg rounded-full shadow-lg"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
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
  }

  if (currentStep === 'results' && temperamentResult) {
    const { classic_temperament, astrological_modality, zodiac_sign } = temperamentResult;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 py-8 px-4">
        <Toaster position="top-right" />
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-rose-400 p-8 text-white text-center">
              <Crown className="h-16 w-16 mx-auto mb-4 animate-bounce" />
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Seu temperamento é</h1>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                {classic_temperament} {astrological_modality}
              </h2>
              <p className="text-xl text-amber-100">
                Baseado em {getZodiacName(zodiac_sign)} - {new Date(temperamentResult.birth_date).toLocaleDateString('pt-BR')}
              </p>
              
              <div className="mt-6 bg-white/20 rounded-full p-4 inline-block">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6" />
                  <span className="font-bold text-lg">{gamificationScore} pontos conquistados!</span>
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-500" />
                    Características principais
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-2xl">💫</span>
                      <div>
                        <h4 className="font-bold text-gray-800">Estilo de comunicação</h4>
                        <p className="text-gray-600 text-sm">Direto e assertivo, gosta de resolver questões rapidamente</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="h-6 w-6 text-emerald-500" />
                    Dicas para crescimento
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <Lightbulb className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-gray-800">Pratique a paciência</h4>
                        <p className="text-gray-600 text-sm">Reserve momentos para ouvir seu parceiro antes de agir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Conquistas desbloqueadas
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-emerald-500 text-white px-4 py-2">🎯 Primeiro diagnóstico</Badge>
                  <Badge className="bg-amber-500 text-white px-4 py-2">⭐ Autoconhecimento</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleShareWithPartner}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 text-lg rounded-full shadow-lg"
                  size="lg"
                >
                  <MessageCircleHeart className="mr-2 h-5 w-5" />
                  Compartilhar com meu amor
                </Button>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="py-3 border-rose-200 text-rose-700 hover:bg-rose-50">
                    <Download className="mr-2 h-4 w-4" />
                    Baixar em PDF
                  </Button>
                  <Button variant="outline" className="py-3 border-amber-200 text-amber-700 hover:bg-amber-50">
                    <Crown className="mr-2 h-4 w-4" />
                    Evoluir juntos - $9.97
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Preview */}
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
                      Perfil completo detalhado
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Exercícios práticos para o casal
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-600 mb-2">$9.97</div>
                  <p className="text-gray-600 mb-4">Pagamento único</p>
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-3 rounded-full shadow-lg">
                    <Crown className="mr-2 h-4 w-4" />
                    Evoluir juntos agora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Modal de Compartilhamento */}
        <ShareWithPartnerModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          userTemperament={compatibilityData?.userTemperament}
          partnerTemperament={compatibilityData?.partnerTemperament}
          compatibility={{ score: compatibilityData?.score }}
          isPremium={false} // Pode ser dinâmico baseado no status do usuário
          userName={formData.name || "Você"}
          partnerName={compatibilityData?.partnerName || "Seu Parceiro"}
        />
      </div>
    );
  }

  if (currentStep === 'sharing') {
    const [partnerEmail, setPartnerEmail] = useState("");
    const [message, setMessage] = useState("Oi amor! 💕 Descobri algo incrível sobre meu temperamento e quero que você descubra o seu também!");

    const sendInvitation = () => {
      if (!partnerEmail) {
        toast.error("Informe o email do seu parceiro");
        return;
      }
      toast.success("Convite enviado com amor! 💕");
      setCurrentStep('home');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 py-8 px-4">
        <Toaster position="top-right" />
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <MessageCircleHeart className="h-6 w-6" />
                Convide seu amor
              </CardTitle>
              <CardDescription className="text-pink-100">Crie um convite especial</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <div>
                <Label htmlFor="partnerEmail">Email do seu parceiro</Label>
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
                <Label htmlFor="message">Mensagem personalizada</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <Button 
                onClick={sendInvitation}
                disabled={!partnerEmail}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 text-lg rounded-full shadow-lg"
                size="lg"
              >
                <Send className="mr-2 h-5 w-5" />
                Enviar convite com amor
              </Button>

              <Button 
                variant="outline"
                onClick={() => setCurrentStep('home')}
                className="w-full"
              >
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>Carregando...</div>
      
      {/* Modal de Compartilhamento */}
      <ShareWithPartnerModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        userTemperament={compatibilityData?.userTemperament}
        partnerTemperament={compatibilityData?.partnerTemperament}
        compatibility={{ score: compatibilityData?.score }}
        isPremium={false} // Pode ser dinâmico baseado no status do usuário
        userName={formData.name || "Você"}
        partnerName={compatibilityData?.partnerName || "Seu Parceiro"}
      />
    </>
  );
};

export default CleanOptimizedTemperamentApp;
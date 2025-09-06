import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { 
  Heart, Users, Plus, Flame, Droplets, Mountain, Wind, 
  Target, Crown, Award, Star, CheckCircle, TrendingUp, 
  AlertTriangle, Lightbulb, BookOpen, Download,
  UserPlus, Sparkles, Trophy, Calendar
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Add Partner Component
export const AddPartnerDialog = ({ open, onOpenChange, userId, onPartnerAdded }) => {
  const [partnerData, setPartnerData] = useState({
    name: "",
    birth_date: ""
  });
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadQuestionnaire();
    }
  }, [open]);

  const loadQuestionnaire = async () => {
    try {
      const response = await axios.get(`${API}/questionnaire`);
      setQuestionnaire(response.data);
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    }
  };

  const handleBasicInfoSubmit = (e) => {
    e.preventDefault();
    if (!partnerData.name || !partnerData.birth_date) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    setShowQuestionnaire(true);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      toast.error("Por favor, selecione uma resposta");
      return;
    }

    const question = questionnaire.questions[currentQuestion];
    const selectedOption = question.options.find(opt => opt.answer === selectedAnswer);
    
    const newAnswer = {
      question_id: question.id,
      answer: selectedAnswer,
      score: selectedOption?.score || 0
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questionnaire.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      submitPartner(newAnswers);
    }
  };

  const submitPartner = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/partners?user_id=${userId}`, {
        name: partnerData.name,
        birth_date: partnerData.birth_date,
        answers: finalAnswers
      });
      
      toast.success("🎉 Parceiro adicionado com sucesso! Primeira Conexão Criada!");
      onPartnerAdded(response.data);
      onOpenChange(false);
      
      // Reset form
      setPartnerData({ name: "", birth_date: "" });
      setShowQuestionnaire(false);
      setAnswers([]);
      setCurrentQuestion(0);
      setSelectedAnswer("");
      
    } catch (error) {
      toast.error("Erro ao adicionar parceiro");
      console.error("Error adding partner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!questionnaire) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Adicionar Parceiro(a)
          </DialogTitle>
          <DialogDescription>
            {!showQuestionnaire 
              ? "Informações básicas do seu parceiro(a)"
              : `Questionário de temperamento - Pergunta ${currentQuestion + 1} de ${questionnaire.questions.length}`
            }
          </DialogDescription>
        </DialogHeader>
        
        {!showQuestionnaire ? (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
            <div>
              <Label htmlFor="partner_name">Nome do Parceiro(a)</Label>
              <Input
                id="partner_name"
                value={partnerData.name}
                onChange={(e) => setPartnerData({...partnerData, name: e.target.value})}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="partner_birth_date">Data de Nascimento</Label>
              <Input
                id="partner_birth_date"
                type="date"
                value={partnerData.birth_date}
                onChange={(e) => setPartnerData({...partnerData, birth_date: e.target.value})}
                required
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">Próximo Passo</h4>
                  <p className="text-blue-700 text-sm">
                    Após inserir os dados básicos, seu parceiro(a) responderá ao mesmo questionário de temperamento que você, 
                    para uma análise completa de compatibilidade.
                  </p>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              Continuar para Questionário
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Progress value={((currentQuestion + 1) / questionnaire.questions.length) * 100} />
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <p className="text-purple-800 font-medium mb-2">
                Respondendo como: {partnerData.name}
              </p>
              <p className="text-sm text-purple-600">
                Responda como se fosse seu parceiro(a), baseado no que você conhece sobre ele(a)
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {questionnaire.questions[currentQuestion].question}
              </h3>
              
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                {questionnaire.questions[currentQuestion].options.map((option, index) => (
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
                  } else {
                    setShowQuestionnaire(false);
                  }
                }}
              >
                {currentQuestion === 0 ? "Voltar" : "Anterior"}
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer || isSubmitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? "Criando..." : 
                 currentQuestion === questionnaire.questions.length - 1 ? "Finalizar" : "Próxima"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Partner Profile Card
export const PartnerProfileCard = ({ partner, onGenerateCompatibility }) => {
  const elementIcons = {
    "Fogo": <Flame className="h-5 w-5 text-red-500" />,
    "Água": <Droplets className="h-5 w-5 text-blue-500" />,
    "Terra": <Mountain className="h-5 w-5 text-green-500" />,
    "Ar": <Wind className="h-5 w-5 text-gray-500" />
  };

  const temperamentColors = {
    "Colérico": "from-red-100 to-orange-100 border-red-200",
    "Sanguíneo": "from-yellow-100 to-orange-100 border-yellow-200", 
    "Melancólico": "from-green-100 to-emerald-100 border-green-200",
    "Fleumático": "from-blue-100 to-indigo-100 border-blue-200"
  };

  const qualityBadgeColors = {
    "Cardinal": "bg-red-100 text-red-800",
    "Fixo": "bg-green-100 text-green-800",
    "Mutável": "bg-blue-100 text-blue-800"
  };

  return (
    <Card className={`border-2 ${temperamentColors[partner.temperament] || temperamentColors.Colérico} hover:shadow-lg transition-all duration-300`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{partner.name}</CardTitle>
            <CardDescription className="mt-2">
              {new Date(partner.birth_date).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              {elementIcons[partner.element]}
              <span className="font-semibold">{partner.element}</span>
            </div>
            <Badge className={qualityBadgeColors[partner.quality]}>
              {partner.quality}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {partner.temperament} de {partner.element}, {partner.quality}
            </h3>
            <p className="text-gray-600">Perfil Completo</p>
          </div>
          
          <Separator />
          
          <div className="flex justify-center">
            <Button
              onClick={() => onGenerateCompatibility(partner)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6"
            >
              <Heart className="mr-2 h-4 w-4" />
              Analisar Compatibilidade
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Compatibility Report Component
export const CompatibilityReportView = ({ report, onClose }) => {
  const getAffinityColor = (affinity) => {
    switch (affinity) {
      case "Alto": return "text-green-600 bg-green-100";
      case "Médio": return "text-yellow-600 bg-yellow-100";
      case "Baixo": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            Análise de Compatibilidade
          </DialogTitle>
          <DialogDescription>
            Relatório completo baseado em Temperamento, Elemento e Qualidade
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Profile Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <ProfileSummaryCard profile={report.user_profile} title="Você" />
            <ProfileSummaryCard profile={report.partner_profile} title="Seu Parceiro(a)" />
          </div>

          {/* Compatibility Score */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`text-6xl font-bold ${getScoreColor(report.compatibility_score)}`}>
                  {report.compatibility_score}%
                </div>
                <div>
                  <Badge className={`text-lg px-4 py-2 ${getAffinityColor(report.general_affinity)}`}>
                    Afinidade {report.general_affinity}
                  </Badge>
                  <p className="text-gray-600 mt-2">Score Geral de Compatibilidade</p>
                </div>
              </div>
              
              <Progress value={report.compatibility_score} className="h-3 mb-4" />
              
              <p className="text-lg text-gray-700 leading-relaxed">
                {report.general_affinity === "Alto" && "Vocês têm uma compatibilidade natural muito forte! A harmonia vem facilmente."}
                {report.general_affinity === "Médio" && "Vocês têm uma boa base para um relacionamento sólido com alguns ajustes."}
                {report.general_affinity === "Baixo" && "Vocês podem construir um relacionamento forte, mas precisarão de mais trabalho e compreensão mútua."}
              </p>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-3 gap-6">
            <AnalysisCard
              title="Análise de Temperamentos"
              content={report.detailed_analysis.temperament_analysis}
              icon={<Users className="h-6 w-6 text-purple-500" />}
              color="purple"
            />
            <AnalysisCard
              title="Análise de Elementos"
              content={report.detailed_analysis.element_analysis}
              icon={<Sparkles className="h-6 w-6 text-blue-500" />}
              color="blue"
            />
            <AnalysisCard
              title="Análise de Qualidades"
              content={report.detailed_analysis.quality_analysis}
              icon={<Target className="h-6 w-6 text-green-500" />}
              color="green"
            />
          </div>

          {/* Strengths, Conflicts, Weaknesses */}
          <div className="grid md:grid-cols-3 gap-6">
            <InsightCard
              title="Pontos Fortes"
              items={report.strength_points}
              icon={<Trophy className="h-6 w-6 text-yellow-500" />}
              color="green"
              bgColor="from-green-50 to-emerald-50"
            />
            <InsightCard
              title="Potenciais Conflitos"
              items={report.potential_conflicts}
              icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
              color="red"
              bgColor="from-red-50 to-pink-50"
            />
            <InsightCard
              title="Pontos de Fraqueza"
              items={report.weakness_points}
              icon={<Target className="h-6 w-6 text-gray-500" />}
              color="orange"
              bgColor="from-orange-50 to-yellow-50"
            />
          </div>

          {/* Recommendations */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-indigo-500" />
                Recomendações Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-400">
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                toast.success("Relatório salvo! Você pode acessá-lo a qualquer momento.");
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Salvar Relatório
            </Button>
            <Button
              onClick={() => {
                toast.info("Funcionalidade de PDF estará disponível em breve!");
              }}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Profile Summary Card
const ProfileSummaryCard = ({ profile, title }) => {
  const elementIcons = {
    "Fogo": <Flame className="h-6 w-6 text-red-500" />,
    "Água": <Droplets className="h-6 w-6 text-blue-500" />,
    "Terra": <Mountain className="h-6 w-6 text-green-500" />,
    "Ar": <Wind className="h-6 w-6 text-gray-500" />
  };

  const temperamentColors = {
    "Colérico": "from-red-100 to-orange-100",
    "Sanguíneo": "from-yellow-100 to-orange-100", 
    "Melancólico": "from-green-100 to-emerald-100",
    "Fleumático": "from-blue-100 to-indigo-100"
  };

  return (
    <Card className={`bg-gradient-to-r ${temperamentColors[profile.temperament]} border-2`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-xl font-semibold">
          {profile.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {profile.temperament}
          </h3>
          <p className="text-gray-600">de {profile.element_pt}, {profile.quality}</p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          {elementIcons[profile.element_pt]}
          <span className="font-semibold">{profile.element_pt}</span>
          <span className="text-gray-400">•</span>
          <span className="font-semibold">{profile.quality}</span>
        </div>
        
        <Badge className="bg-white text-gray-800 border">
          {profile.zodiac_sign}
        </Badge>
      </CardContent>
    </Card>
  );
};

// Analysis Card
const AnalysisCard = ({ title, content, icon, color }) => {
  const colorClasses = {
    purple: "from-purple-50 to-indigo-50 border-purple-200",
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    green: "from-green-50 to-emerald-50 border-green-200"
  };

  return (
    <Card className={`bg-gradient-to-r ${colorClasses[color]} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
};

// Insight Card
const InsightCard = ({ title, items, icon, color, bgColor }) => {
  const borderColors = {
    green: "border-green-200",
    red: "border-red-200",
    orange: "border-orange-200"
  };

  return (
    <Card className={`bg-gradient-to-r ${bgColor} border-2 ${borderColors[color]}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Compatibility Dashboard
export const CompatibilityDashboard = ({ userId, userIsPremium = false }) => {
  const [partners, setPartners] = useState([]);
  const [partnerLimits, setPartnerLimits] = useState(null);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedCompatibilityReport, setSelectedCompatibilityReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPartners();
    loadPartnerLimits();
  }, [userId]);

  const loadPartners = async () => {
    try {
      const response = await axios.get(`${API}/partners/${userId}`);
      setPartners(response.data);
    } catch (error) {
      console.error("Error loading partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPartnerLimits = async () => {
    try {
      const response = await axios.get(`${API}/partners/limits/${userId}`);
      setPartnerLimits(response.data);
    } catch (error) {
      console.error("Error loading partner limits:", error);
    }
  };

  const handlePartnerAdded = (newPartner) => {
    setPartners([...partners, newPartner]);
    loadPartnerLimits(); // Reload limits after adding partner
  };

  const handleAddPartnerClick = () => {
    if (!partnerLimits?.can_add_more) {
      if (!partnerLimits?.is_premium) {
        toast.error("Usuários gratuitos podem adicionar apenas 1 parceiro!");
        setShowUpgradeModal(true);
        return;
      } else {
        toast.error("Limite máximo de parceiros atingido!");
        return;
      }
    }
    setShowAddPartner(true);
  };

  const handleGenerateCompatibility = async (partner) => {
    try {
      toast.info("Gerando análise de compatibilidade...");
      const response = await axios.post(`${API}/compatibility/enhanced?user_id=${userId}&partner_id=${partner.id}`);
      setSelectedCompatibilityReport(response.data);
    } catch (error) {
      toast.error("Erro ao gerar compatibilidade");
      console.error("Error generating compatibility:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando parceiros...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Heart className="h-8 w-8 text-pink-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Compatibilidade de Casal</h2>
            {partnerLimits && (
              <div className="flex items-center gap-2 mt-1">
                <Badge className={partnerLimits.is_premium ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}>
                  {partnerLimits.is_premium ? "Premium" : "Gratuito"}
                </Badge>
                <span className="text-sm text-gray-500">
                  {partnerLimits.current_partners} de {partnerLimits.max_partners} parceiros
                </span>
                {partnerLimits.remaining_slots > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    +{partnerLimits.remaining_slots} disponível{partnerLimits.remaining_slots > 1 ? 'is' : ''}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!partnerLimits?.is_premium && partnerLimits?.current_partners >= 1 && (
            <Button
              onClick={() => setShowUpgradeModal(true)}
              variant="outline"
              className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade Premium
            </Button>
          )}
          <Button
            onClick={handleAddPartnerClick}
            disabled={!partnerLimits?.can_add_more}
            className={`${
              partnerLimits?.can_add_more 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus className="mr-2 h-4 w-4" />
            {partnerLimits?.can_add_more ? "Adicionar Parceiro(a)" : "Limite Atingido"}
          </Button>
        </div>
      </div>

      {partners.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum parceiro adicionado ainda
            </h3>
            <p className="text-gray-600 mb-4">
              Adicione seu parceiro(a) para descobrir a compatibilidade entre vocês baseada em 
              temperamentos, elementos e qualidades astrológicas.
            </p>
            
            {partnerLimits && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {partnerLimits.is_premium ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Heart className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="font-semibold text-gray-800">
                    {partnerLimits.is_premium ? "Usuário Premium" : "Usuário Gratuito"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {partnerLimits.is_premium 
                    ? `Você pode adicionar até ${partnerLimits.max_partners} parceiros` 
                    : `Você pode adicionar ${partnerLimits.max_partners} parceiro. Upgrade para Premium e adicione até 4!`
                  }
                </p>
              </div>
            )}
            
            <Button
              onClick={handleAddPartnerClick}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!partnerLimits?.can_add_more}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Parceiro(a)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <PartnerProfileCard
                key={partner.id}
                partner={partner}
                onGenerateCompatibility={handleGenerateCompatibility}
              />
            ))}
            
            {/* Add Partner Placeholder Card */}
            {partnerLimits?.can_add_more && (
              <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors duration-300 cursor-pointer" onClick={handleAddPartnerClick}>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-purple-100 p-4 rounded-full mb-4">
                    <Plus className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Adicionar Novo Parceiro
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {partnerLimits.remaining_slots} {partnerLimits.remaining_slots === 1 ? 'slot disponível' : 'slots disponíveis'}
                  </p>
                  <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Limit Warning for Free Users */}
          {!partnerLimits?.is_premium && partners.length === 1 && (
            <Card className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Crown className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Limite de Parceiros Atingido
                    </h3>
                    <p className="text-yellow-700 text-sm mb-3">
                      Usuários gratuitos podem adicionar apenas 1 parceiro. Faça upgrade para Premium e analise até 4 relacionamentos diferentes!
                    </p>
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Ver Upgrade Premium
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Partner Dialog */}
      <AddPartnerDialog
        open={showAddPartner}
        onOpenChange={setShowAddPartner}
        userId={userId}
        onPartnerAdded={handlePartnerAdded}
      />

      {/* Compatibility Report Modal */}
      {selectedCompatibilityReport && (
        <CompatibilityReportView
          report={selectedCompatibilityReport}
          onClose={() => setSelectedCompatibilityReport(null)}
        />
      )}

      {/* Partner Limit Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Limite de Parceiros Atingido
            </DialogTitle>
            <DialogDescription>
              Desbloqueie mais compatibilidades com o Premium
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg mb-4">
                <Users className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Usuários Gratuitos</h3>
                <p className="text-gray-600 text-sm">Máximo de 1 parceiro</p>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
                <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-bold text-yellow-800 mb-2">Usuários Premium</h3>
                <p className="text-yellow-700 text-sm mb-3">Até 4 parceiros diferentes</p>
                <Badge className="bg-yellow-100 text-yellow-800">+300% mais compatibilidades!</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Com Premium você ganha:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Até 4 parceiros para análise de compatibilidade</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Compare diferentes relacionamentos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Histórico completo de compatibilidades</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Relatórios PDF exportáveis</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">R$ 12</div>
              <p className="text-gray-600 text-sm mb-4">Pagamento único</p>
              
              <Button
                onClick={() => {
                  toast.info("Redirecionando para upgrade Premium...");
                  setShowUpgradeModal(false);
                  // Here you would trigger the premium upgrade flow
                }}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Crown className="mr-2 h-4 w-4" />
                Fazer Upgrade Premium
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
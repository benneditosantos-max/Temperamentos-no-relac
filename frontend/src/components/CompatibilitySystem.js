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
export const CompatibilityDashboard = ({ userId }) => {
  const [partners, setPartners] = useState([]);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [selectedCompatibilityReport, setSelectedCompatibilityReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPartners();
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

  const handlePartnerAdded = (newPartner) => {
    setPartners([...partners, newPartner]);
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
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-pink-500" />
          <h2 className="text-3xl font-bold text-gray-900">Compatibilidade de Casal</h2>
        </div>
        <Button
          onClick={() => setShowAddPartner(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Parceiro(a)
        </Button>
      </div>

      {partners.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum parceiro adicionado ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Adicione seu parceiro(a) para descobrir a compatibilidade entre vocês baseada em 
              temperamentos, elementos e qualidades astrológicas.
            </p>
            <Button
              onClick={() => setShowAddPartner(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Parceiro(a)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <PartnerProfileCard
              key={partner.id}
              partner={partner}
              onGenerateCompatibility={handleGenerateCompatibility}
            />
          ))}
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
    </div>
  );
};
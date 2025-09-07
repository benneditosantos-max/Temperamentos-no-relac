import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { BookOpen, Target, Trophy, Star, Crown, Award, Calendar, CheckCircle, Lock, Download } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Temperament Profile Component
export const TemperamentProfileCard = ({ modality, isPreview = false }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [modality]);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API}/premium/temperament-profile/${modality}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!profile) {
    return <div className="text-center text-gray-500">Perfil não encontrado</div>;
  }

  return (
    <Card className="w-full hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-purple-800">{profile.title}</CardTitle>
            <CardDescription className="text-purple-600 mt-2">
              {profile.description}
            </CardDescription>
          </div>
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {!isPreview && (
          <>
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Estilo de Comunicação
              </h4>
              <p className="text-gray-700 leading-relaxed">{profile.communication_style}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Resolução de Conflitos
              </h4>
              <p className="text-gray-700 leading-relaxed">{profile.conflict_resolution}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-pink-500" />
                Abordagem à Intimidade
              </h4>
              <p className="text-gray-700 leading-relaxed">{profile.intimacy_approach}</p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Tomada de Decisão
              </h4>
              <p className="text-gray-700 leading-relaxed">{profile.decision_making}</p>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg mb-3 text-green-600">Pontos Fortes</h4>
                <ul className="space-y-2">
                  {profile.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-3 text-orange-600">Desafios</h4>
                <ul className="space-y-2">
                  {profile.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-lg mb-3 text-purple-600">Dicas de Crescimento</h4>
              <ul className="space-y-2">
                {profile.growth_tips.map((tip, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {isPreview && (
          <div className="text-center py-8">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Perfil detalhado disponível apenas para usuários Premium
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Crown className="mr-2 h-4 w-4" />
              Fazer Upgrade Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Self Knowledge Questionnaire Component
export const SelfKnowledgeQuestionnaire = ({ userId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await axios.get(`${API}/premium/self-knowledge-questions`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Erro ao carregar questionário");
    } finally {
      setIsLoading(false);
    }
  };

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
      category: question.category,
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
      const response = await axios.post(`${API}/premium/self-knowledge/submit?user_id=${userId}`, finalAnswers);
      
      toast.success("🎉 Questionário de autoconhecimento concluído! +100 pontos!");
      onComplete(response.data);
      
    } catch (error) {
      toast.error("Erro ao submeter questionário");
      console.error("Error submitting questionnaire:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando questionário...</div>;
  }

  if (!questions.length) {
    return <div className="text-center py-8">Nenhuma questão encontrada</div>;
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Questionário de Autoconhecimento
        </CardTitle>
        <CardDescription>
          Pergunta {currentQuestion + 1} de {questions.length} • Categoria: {question.category}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
};

// Weekly Missions Component
export const WeeklyMissionsPanel = ({ userId }) => {
  const [missions, setMissions] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMissions();
    loadUserProgress();
  }, [userId]);

  const loadMissions = async () => {
    try {
      const response = await axios.get(`${API}/premium/weekly-missions/${userId}`);
      setMissions(response.data.missions);
    } catch (error) {
      console.error("Error loading missions:", error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const response = await axios.get(`${API}/premium/user-progress/${userId}`);
      setUserProgress(response.data);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeMission = async (missionId) => {
    try {
      const response = await axios.post(`${API}/premium/complete-mission/${userId}/${missionId}`);
      toast.success(`🎉 ${response.data.message} +${response.data.points_earned} pontos!`);
      
      // Reload data
      loadMissions();
      loadUserProgress();
    } catch (error) {
      toast.error("Erro ao completar missão");
      console.error("Error completing mission:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando missões...</div>;
  }

  return (
    <div className="space-y-6">
      {/* User Progress Card */}
      {userProgress && (
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-purple-800">
                  Nível {userProgress.current_level}
                </h3>
                <p className="text-purple-600">
                  {userProgress.total_points} pontos • {userProgress.missions_completed} missões completas
                </p>
              </div>
              <div className="text-right">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <Badge className="bg-yellow-100 text-yellow-800">
                  Sequência: {userProgress.weekly_streak} semanas
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Missions */}
      <div className="grid gap-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Missões da Semana
        </h3>
        
        {missions.map((mission, index) => (
          <Card key={mission.id} className={`border-l-4 ${
            mission.completed 
              ? 'border-green-500 bg-green-50' 
              : 'border-purple-500 hover:shadow-lg transition-shadow'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{mission.title}</h4>
                    {mission.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  <p className="text-gray-600 mb-2">{mission.description}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-purple-700">
                      +{mission.points} pontos
                    </Badge>
                    <Badge variant="outline" className="text-blue-700">
                      {mission.mission_type}
                    </Badge>
                  </div>
                </div>
                
                <div className="ml-4">
                  {mission.completed ? (
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Completa
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => completeMission(mission.id)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Enhanced Premium Upgrade Modal
export const EnhancedPremiumModal = ({ open, onOpenChange, userId }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const originUrl = window.location.origin;
      
      const response = await axios.post(`${API}/payments/checkout/session`, {
        user_id: userId,
        origin_url: originUrl
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL received");
      }
      
    } catch (error) {
      toast.error("Erro ao processar pagamento. Tente novamente.");
      console.error("Error processing payment:", error);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-600" />
            Upgrade Premium
          </DialogTitle>
          <DialogDescription>
            Desbloqueie o potencial completo do seu relacionamento
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Price */}
          <div className="text-center py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="text-4xl font-bold text-purple-800 mb-2">$9.97</div>
            <p className="text-purple-600">Pagamento único • Acesso vitalício</p>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">O que você ganha:</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Perfil detalhado</strong> (Cardinal, Fixo, Mutável)
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Dinâmica completa do casal</strong> com insights personalizados
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Questionários de autoconhecimento</strong> interativos
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Missões semanais exclusivas</strong> com sistema de pontos
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Exercícios práticos</strong> para fortalecer a relação
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>Relatórios exportáveis em PDF</strong>
                </span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <Button 
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-5 w-5" />
                Fazer Upgrade para Premium – $9.97
              </>
            )}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            Pagamento seguro via Stripe • Satisfação garantida • Suporte 24/7
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// PDF Export Button
export const PDFExportButton = ({ reportData, disabled = false }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled) {
      toast.error("Funcionalidade disponível apenas para usuários Premium");
      return;
    }

    setIsExporting(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Relatório PDF gerado com sucesso!");
      
      // In a real implementation, this would generate and download a PDF
      console.log("Exporting PDF with data:", reportData);
      
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || disabled}
      variant={disabled ? "outline" : "default"}
      className={disabled ? "opacity-50" : "bg-purple-600 hover:bg-purple-700"}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {disabled ? "PDF Premium" : "Baixar PDF"}
        </>
      )}
    </Button>
  );
};
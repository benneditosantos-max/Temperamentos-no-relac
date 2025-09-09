import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { toast } from "sonner";

// Import new enhanced components
import CoupleExercises from "./CoupleExercises";
import EnhancedTemperamentQuestionnaire from "./EnhancedTemperamentQuestionnaire";
import AdvancedCompatibilityReport from "./AdvancedCompatibilityReport";
import DetailedTemperamentProfile from "./DetailedTemperamentProfile";

import { 
  BookOpen, Target, Trophy, Star, Crown, Award, Calendar, CheckCircle, Lock, Download,
  Heart, Brain, Zap, Shield, Users, MessageCircle, Lightbulb, TrendingUp, Map, Timer,
  Save, PenTool, Play, Home
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Temperament Profile with Deep Insights
export const EnhancedTemperamentProfile = ({ modality, isPreview = false, userData = null }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mapeamento de temperamentos astrológicos para clássicos
  const getClassicTemperament = (astrologicalModality) => {
    const mapping = {
      'cardinal': 'Colérico',
      'fixed': 'Melancólico', 
      'mutable': 'Sanguíneo'
    };
    return mapping[astrologicalModality] || 'Fleumático';
  };

  // Mapeamento para os complementares astrológicos
  const getAstrologicalName = (astrologicalModality) => {
    const mapping = {
      'cardinal': 'Cardinal',
      'fixed': 'Fixo',
      'mutable': 'Mutável'
    };
    return mapping[astrologicalModality] || 'Cardinal';
  };

  // Função auxiliar para obter nome do signo zodiacal
  const getZodiacName = (zodiacSign) => {
    const names = {
      'aries': 'Áries',
      'taurus': 'Touro', 
      'gemini': 'Gêmeos',
      'cancer': 'Câncer',
      'leo': 'Leão',
      'virgo': 'Virgem',
      'libra': 'Libra',
      'scorpio': 'Escorpião',
      'sagittarius': 'Sagitário',
      'capricorn': 'Capricórnio',
      'aquarius': 'Aquário',
      'pisces': 'Peixes'
    };
    return names[zodiacSign] || zodiacSign;
  };

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
    return <div className="animate-pulse bg-gradient-to-r from-purple-100 to-pink-100 h-64 rounded-lg"></div>;
  }

  if (!profile) {
    return <div className="text-center text-gray-500">Perfil não encontrado</div>;
  }

  const modalityColors = {
    cardinal: { bg: "from-red-50 to-orange-50", accent: "text-red-600", icon: "text-red-500" },
    fixed: { bg: "from-green-50 to-emerald-50", accent: "text-green-600", icon: "text-green-500" },
    mutable: { bg: "from-blue-50 to-indigo-50", accent: "text-blue-600", icon: "text-blue-500" }
  };

  const colors = modalityColors[modality] || modalityColors.cardinal;

  return (
    <Card className="w-full hover:shadow-2xl transition-all duration-300 border-2 border-yellow-200">
      <CardHeader className={`bg-gradient-to-r ${colors.bg} border-b-2 border-yellow-200`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`text-3xl ${colors.accent} font-bold`}>
              Análise Profunda - {getClassicTemperament(modality)} {getAstrologicalName(modality)}
              {userData && userData.zodiac_sign && (
                <span className="text-sm font-normal text-gray-600 block mt-1">
                  Baseado em {getZodiacName(userData.zodiac_sign)} ({userData.birth_date})
                </span>
              )}
            </CardTitle>
            <CardDescription className={`${colors.accent} mt-2 text-lg leading-relaxed`}>
              {profile.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-center">
            <Crown className="h-10 w-10 text-yellow-500 mb-2" />
            <Badge className="bg-yellow-100 text-yellow-800 font-semibold">Premium</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {!isPreview && (
          <>
            {/* Core Behaviors Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <MessageCircle className={`h-6 w-6 ${colors.icon}`} />
                    Estilo de Comunicação
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {profile.communication_style}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Target className={`h-6 w-6 ${colors.icon}`} />
                    Resolução de Conflitos
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {profile.conflict_resolution}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Heart className={`h-6 w-6 ${colors.icon}`} />
                    Abordagem à Intimidade
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {profile.intimacy_approach}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Brain className={`h-6 w-6 ${colors.icon}`} />
                    Tomada de Decisão
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {profile.decision_making}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Emotional Triggers - Premium Feature */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-100">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-red-500" />
                Gatilhos Emocionais
              </h4>
              <div className="grid gap-3">
                {profile.emotional_triggers.map((trigger, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                    <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">{trigger}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Growth Strategies - Premium Feature */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-100">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                Estratégias de Crescimento
              </h4>
              <div className="space-y-4">
                {profile.growth_strategies.map((strategy, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-400">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full mt-1">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-800 mb-2">Estratégia {index + 1}</h5>
                        <p className="text-gray-700 leading-relaxed">{strategy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Daily Practices - Premium Feature */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-500" />
                Práticas Diárias
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {profile.daily_practices.map((practice, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-blue-800">
                        {practice.split(':')[0]}
                      </span>
                    </div>
                    <p className="text-gray-700">{practice.split(':')[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Traditional Strengths & Challenges */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-xl text-green-600 flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Pontos Fortes
                </h4>
                <div className="space-y-3">
                  {profile.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-xl text-orange-600 flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Desafios
                </h4>
                <div className="space-y-3">
                  {profile.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg">
                      <div className="w-5 h-5 border-2 border-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">{challenge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Relationship Dynamics - Premium Feature */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-500" />
                Dinâmicas de Relacionamento
              </h4>
              <div className="space-y-4">
                {Object.entries(profile.relationship_dynamics).map(([key, dynamic]) => (
                  <div key={key} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-purple-500" />
                      <span className="font-semibold text-purple-800 capitalize">
                        {key.replace('with_', 'Com ')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{dynamic}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isPreview && (
          <div className="text-center py-12">
            <Lock className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Análise Profunda Disponível
            </h3>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-md mx-auto">
              Desbloqueie gatilhos emocionais, estratégias de crescimento, práticas diárias e dinâmicas de relacionamento personalizadas
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3">
              <Crown className="mr-2 h-5 w-5" />
              Upgrade Premium - $9.97
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Couple Exercises Component
export const CoupleExercisesPanel = ({ userId }) => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await axios.get(`${API}/premium/couple-exercises/${userId}`);
      setExercises(response.data.exercises);
    } catch (error) {
      console.error("Error loading exercises:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openExerciseDetail = (exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetail(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando exercícios...</div>;
  }

  const categoryColors = {
    communication: { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", icon: "text-blue-500" },
    conflict_resolution: { bg: "from-red-50 to-pink-50", border: "border-red-200", icon: "text-red-500" },
    intimacy: { bg: "from-purple-50 to-pink-50", border: "border-purple-200", icon: "text-purple-500" }
  };

  const categoryIcons = {
    communication: MessageCircle,
    conflict_resolution: Shield,
    intimacy: Heart
  };

  const difficultyLabels = {
    1: { label: "Iniciante", color: "bg-green-100 text-green-800" },
    2: { label: "Fácil", color: "bg-blue-100 text-blue-800" },
    3: { label: "Intermediário", color: "bg-yellow-100 text-yellow-800" },
    4: { label: "Avançado", color: "bg-orange-100 text-orange-800" },
    5: { label: "Especialista", color: "bg-red-100 text-red-800" }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-6 w-6 text-purple-500" />
        <h3 className="text-2xl font-bold text-gray-900">Exercícios para Casais</h3>
        <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
      </div>

      <div className="grid gap-6">
        {exercises.map((exercise, index) => {
          const colors = categoryColors[exercise.category] || categoryColors.communication;
          const IconComponent = categoryIcons[exercise.category] || MessageCircle;
          const difficulty = {
            1: { label: "Iniciante", color: "bg-green-100 text-green-800" },
            2: { label: "Fácil", color: "bg-blue-100 text-blue-800" },
            3: { label: "Intermediário", color: "bg-yellow-100 text-yellow-800" },
            4: { label: "Avançado", color: "bg-orange-100 text-orange-800" },
            5: { label: "Super Avançado", color: "bg-red-100 text-red-800" }
          }[exercise.difficulty_level] || { label: "Iniciante", color: "bg-green-100 text-green-800" };

          const isLocked = !exercise.is_unlocked;
          const isCompleted = exercise.is_completed;

          return (
            <Card key={index} className={`border-2 ${isLocked ? 'border-gray-200 bg-gray-50' : colors.border} hover:shadow-xl transition-all duration-300 ${isLocked ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${isLocked ? 'bg-gray-200' : `bg-gradient-to-r ${colors.bg}`} rounded-lg`}>
                        {isLocked ? (
                          <Lock className="h-6 w-6 text-gray-400" />
                        ) : (
                          <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xl font-bold ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                          {exercise.title}
                        </h4>
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className={`leading-relaxed mb-4 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isLocked ? 'Complete o exercício anterior com feedback para desbloquear' : exercise.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={difficulty.color}>{difficulty.label}</Badge>
                      {!isLocked && (
                        <>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Timer className="h-4 w-4" />
                            <span>{exercise.duration_minutes} min</span>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {exercise.category.replace('_', ' ')}
                          </Badge>
                        </>
                      )}
                      {isLocked && (
                        <Badge variant="outline" className="text-gray-500 border-gray-300">
                          🔒 Bloqueado
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          ✅ Completado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {isLocked ? (
                      <span>Complete o nível anterior primeiro</span>
                    ) : (
                      <span><span className="font-medium">{exercise.expected_outcomes.length}</span> resultados esperados</span>
                    )}
                  </div>
                  <Button
                    onClick={() => openExerciseDetail(exercise)}
                    disabled={isLocked}
                    className={isLocked ? "bg-gray-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}
                  >
                    {isLocked ? "🔒 Bloqueado" : "Ver Detalhes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <Dialog open={showExerciseDetail} onOpenChange={setShowExerciseDetail}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedExercise.title}</DialogTitle>
              <DialogDescription className="text-lg">
                {selectedExercise.description}
              </DialogDescription>
            </DialogHeader>
            
            <ExerciseDetailContent 
              exercise={selectedExercise} 
              userId={userId}
              onComplete={() => {
                setShowExerciseDetail(false);
                loadExercises(); // Reload to update progress
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Exercise Detail Content
const ExerciseDetailContent = ({ exercise, userId, onComplete }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    communication: "from-blue-50 to-indigo-50",
    conflict_resolution: "from-red-50 to-pink-50", 
    intimacy: "from-purple-50 to-pink-50"
  };

  const handleComplete = async () => {
    if (!feedback.trim()) {
      toast.error("Por favor, escreva um feedback sobre o exercício");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/premium/complete-exercise`, null, {
        params: {
          user_id: userId,
          exercise_title: exercise.title,
          feedback: feedback
        }
      });

      toast.success(`🎉 ${response.data.message} (+${response.data.points_earned} pontos)`);
      
      if (response.data.next_unlocked) {
        toast.success(`🔓 Novo exercício desbloqueado: ${response.data.next_unlocked}!`);
      }

      setShowFeedbackForm(false);
      setFeedback('');
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Error completing exercise:", error);
      toast.error(error.response?.data?.detail || "Erro ao completar exercício");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-8 p-6 bg-gradient-to-r ${colors[exercise.category] || colors.communication} rounded-lg`}>
      {/* Instructions */}
      <div>
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Passo a Passo
        </h4>
        <div className="space-y-3">
          {exercise.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
              <div className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-700 leading-relaxed">{instruction}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-green-500" />
          Materiais Necessários
        </h4>
        <div className="grid md:grid-cols-2 gap-3">
          {exercise.required_materials.map((material, index) => (
            <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">{material}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Outcomes */}
      <div>
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Resultados Esperados
        </h4>
        <div className="space-y-2">
          {exercise.expected_outcomes.map((outcome, index) => (
            <div key={index} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-700 font-medium">{outcome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Questions */}
      <div>
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-orange-500" />
          Reflexões Pós-Exercício
        </h4>
        <div className="space-y-3">
          {exercise.follow_up_questions.map((question, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-400">
              <p className="text-gray-700 leading-relaxed font-medium">{question}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Reflection Assistant */}
      <PersonalReflectionAssistant exerciseTitle={exercise.title} />

      {/* Exercise Completion Section */}
      {!exercise.is_completed && !showFeedbackForm && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Pronto para Completar o Exercício?</h4>
            <p className="text-gray-700 mb-4">
              Depois de praticar este exercício, compartilhe seu feedback para desbloquear o próximo nível!
            </p>
            <Button
              onClick={() => setShowFeedbackForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Award className="mr-2 h-4 w-4" />
              Marcar como Completado
            </Button>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      {showFeedbackForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-6 w-6 text-purple-600" />
            <h4 className="text-xl font-bold text-gray-800">Compartilhe sua Experiência</h4>
          </div>
          
          <p className="text-gray-600 mb-4">
            Para desbloquear o próximo exercício, nos conte como foi sua experiência com este exercício:
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="exercise-feedback" className="font-medium text-gray-800">
                Como foi praticar este exercício? *
              </Label>
              <textarea
                id="exercise-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Compartilhe suas impressões, descobertas, desafios e resultados obtidos com este exercício..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mt-2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de 50 caracteres • {feedback.length}/1000
              </p>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={() => {setShowFeedbackForm(false); setFeedback('');}}
                variant="outline"
                className="border-gray-300 text-gray-700"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleComplete}
                disabled={isSubmitting || feedback.length < 50}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completar Exercício
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Already Completed */}
      {exercise.is_completed && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-800 mb-1">✅ Exercício Completado!</h4>
              <p className="text-gray-700">
                Parabéns! Você já completou este exercício e desbloqueou novos níveis. Continue sua jornada de crescimento!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Journey Levels Component
export const JourneyLevelsPanel = ({ userId }) => {
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJourneyLevels();
  }, [userId]);

  const loadJourneyLevels = async () => {
    try {
      const response = await axios.get(`${API}/premium/journey-levels/${userId}`);
      setLevels(response.data.levels);
      setCurrentLevel(response.data.current_level);
    } catch (error) {
      console.error("Error loading journey levels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando jornada...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Map className="h-6 w-6 text-purple-500" />
        <h3 className="text-2xl font-bold text-gray-900">Modo Jornada</h3>
        <Badge className="bg-purple-100 text-purple-800">Nível {currentLevel}</Badge>
      </div>

      <div className="space-y-6">
        {levels.map((level) => (
          <JourneyLevelCard 
            key={level.level} 
            level={level} 
            isCurrent={level.is_current}
          />
        ))}
      </div>
    </div>
  );
};

// Journey Level Card
const JourneyLevelCard = ({ level, isCurrent }) => {
  const getStatusColor = () => {
    if (level.is_unlocked && isCurrent) return "from-purple-100 to-pink-100 border-purple-300";
    if (level.is_unlocked) return "from-green-100 to-emerald-100 border-green-300";
    return "from-gray-100 to-gray-200 border-gray-300";
  };

  const getStatusIcon = () => {
    if (level.is_unlocked && isCurrent) return <Zap className="h-6 w-6 text-purple-500" />;
    if (level.is_unlocked) return <CheckCircle className="h-6 w-6 text-green-500" />;
    return <Lock className="h-6 w-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (level.is_unlocked && isCurrent) return "Atual";
    if (level.is_unlocked) return "Desbloqueado";
    return "Bloqueado";
  };

  return (
    <Card className={`border-2 ${getStatusColor()} transition-all duration-300 ${isCurrent ? 'shadow-xl' : 'hover:shadow-lg'}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon()}
              <h4 className="text-xl font-bold text-gray-900">
                Nível {level.level}: {level.title}
              </h4>
              <Badge className={
                level.is_unlocked && isCurrent ? "bg-purple-100 text-purple-800" :
                level.is_unlocked ? "bg-green-100 text-green-800" :
                "bg-gray-100 text-gray-600"
              }>
                {getStatusText()}
              </Badge>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">{level.description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Conteúdo Disponível:</h5>
                <ul className="space-y-1">
                  {level.content_unlocked.map((content, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      {content}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Exercícios:</h5>
                <ul className="space-y-1">
                  {level.exercises_available.map((exercise, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      {exercise}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Duração estimada: {level.estimated_duration_days} dias</span>
          {level.is_unlocked && (
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>Conteúdo liberado!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Daily Advice Component
export const DailyAdviceCard = ({ userId }) => {
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDailyAdvice();
  }, [userId]);

  const loadDailyAdvice = async () => {
    try {
      const response = await axios.get(`${API}/premium/daily-advice/${userId}`);
      setAdvice(response.data);
    } catch (error) {
      console.error("Error loading daily advice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gradient-to-r from-indigo-100 to-purple-100 h-64 rounded-lg"></div>;
  }

  if (!advice) {
    return <div className="text-center text-gray-500">Conselho não disponível</div>;
  }

  const categoryColors = {
    leadership: { bg: "from-red-50 to-orange-50", icon: "text-red-500" },
    productivity: { bg: "from-blue-50 to-indigo-50", icon: "text-blue-500" },
    support: { bg: "from-green-50 to-emerald-50", icon: "text-green-500" },
    growth: { bg: "from-purple-50 to-pink-50", icon: "text-purple-500" },
    harmony: { bg: "from-teal-50 to-cyan-50", icon: "text-teal-500" },
    assertiveness: { bg: "from-yellow-50 to-orange-50", icon: "text-yellow-600" }
  };

  const colors = categoryColors[advice.category] || categoryColors.growth;

  return (
    <Card className={`border-2 border-indigo-200 bg-gradient-to-r ${colors.bg} hover:shadow-xl transition-all duration-300`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className={`h-6 w-6 ${colors.icon}`} />
            <CardTitle className="text-xl">Conselheiro Virtual</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
          </div>
        </div>
        <CardDescription className="capitalize font-medium">
          Conselho {advice.category} • Temperamento {advice.modality}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <Brain className={`h-8 w-8 ${colors.icon} flex-shrink-0 mt-1`} />
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Conselho do Dia</h4>
              <p className="text-gray-700 leading-relaxed text-lg">{advice.advice_text}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <Target className={`h-6 w-6 ${colors.icon} flex-shrink-0 mt-1`} />
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Reflexão</h4>
              <p className="text-gray-700 leading-relaxed">{advice.reflection_question}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className={`h-6 w-6 ${colors.icon} flex-shrink-0 mt-1`} />
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Ação Prática</h4>
              <p className="text-gray-700 leading-relaxed">{advice.action_item}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Conselho personalizado para o seu temperamento • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Personalized Reports Component
export const PersonalizedReportPanel = ({ userId }) => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (reportType = "weekly_progress") => {
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/premium/generate-report/${userId}?report_type=${reportType}`);
      setReport(response.data);
      toast.success("Relatório personalizado gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-500" />
          <h3 className="text-2xl font-bold text-gray-900">Relatórios Personalizados</h3>
          <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
        </div>
        
        <Button
          onClick={() => generateReport()}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatório
            </>
          )}
        </Button>
      </div>

      {report && (
        <PersonalizedReportDisplay report={report} />
      )}
    </div>
  );
};

// Personalized Report Display
const PersonalizedReportDisplay = ({ report }) => {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-2xl text-purple-800">
          Relatório de Progresso Personalizado
        </CardTitle>
        <CardDescription>
          Gerado em {new Date(report.generated_at).toLocaleDateString('pt-BR')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Achievements */}
        <div>
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Suas Conquistas
          </h4>
          <div className="space-y-2">
            {report.achievements.map((achievement, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-700 font-medium">{achievement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-blue-500" />
            Insights Personalizados
          </h4>
          <div className="space-y-3">
            {report.insights.map((insight, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400">
                <p className="text-gray-700 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Areas */}
        <div>
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Áreas de Crescimento
          </h4>
          <div className="space-y-2">
            {report.growth_areas.map((area, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-700 font-medium">{area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            Próximos Passos
          </h4>
          <div className="space-y-2">
            {report.next_steps.map((step, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 font-medium">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Advice */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-500" />
            Conselho Personalizado
          </h4>
          <p className="text-gray-700 leading-relaxed text-lg">{report.custom_advice}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Personal Reflection Assistant Component
const PersonalReflectionAssistant = ({ exerciseTitle }) => {
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [savedReflections, setSavedReflections] = useState([]);

  const guidedQuestions = [
    "O que este exercício revelou sobre meu temperamento e minhas reações?",
    "Como isso impacta meus relacionamentos atuais?", 
    "Que padrões consigo identificar nas minhas interações?",
    "Que mudanças posso aplicar a partir desta reflexão?"
  ];

  const handleSaveReflection = () => {
    if (reflectionText.trim()) {
      const newReflection = {
        id: Date.now(),
        exercise: exerciseTitle,
        text: reflectionText,
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR')
      };
      
      setSavedReflections([...savedReflections, newReflection]);
      setReflectionText('');
      toast.success("Reflexão registrada com sucesso! 🌟");
    }
  };

  const nextStep = () => {
    if (currentStep < guidedQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-full">
            <Brain className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">Assistente de Reflexões Pessoais</h4>
            <p className="text-emerald-700 text-sm">Registre suas respostas e insights após o exercício</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowReflection(!showReflection)}
          variant="outline"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
        >
          {showReflection ? 'Ocultar' : 'Começar Reflexão'}
        </Button>
      </div>

      {showReflection && (
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-emerald-400">
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-gray-800 mb-2">Olá! Vamos refletir juntos 🤗</h5>
                <p className="text-gray-700 leading-relaxed">
                  Este é seu espaço seguro para registrar pensamentos e insights após completar o exercício 
                  "<strong>{exerciseTitle}</strong>". Escreva suas respostas de forma sincera e sem julgamentos. 
                  Cada reflexão é um passo importante no seu crescimento pessoal e no fortalecimento dos seus relacionamentos.
                </p>
              </div>
            </div>
          </div>

          {/* Guided Questions Navigation */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-bold text-gray-800">Perguntas Guiadas para Reflexão</h5>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {currentStep + 1} de {guidedQuestions.length}
                </span>
                <div className="flex gap-1">
                  {guidedQuestions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mb-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                <p className="text-gray-800 font-medium leading-relaxed">
                  {guidedQuestions[currentStep]}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-700"
              >
                ← Anterior
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={currentStep === guidedQuestions.length - 1}
                variant="outline"
                size="sm"
                className="border-emerald-300 text-emerald-700"
              >
                Próxima →
              </Button>
            </div>
          </div>

          {/* Reflection Text Area */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <PenTool className="h-5 w-5 text-emerald-600" />
              <h5 className="font-bold text-gray-800">Registre Seus Pensamentos</h5>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Use este espaço para registrar livremente seus pensamentos, insights e sentimentos. 
              Não há respostas certas ou erradas - apenas sua verdade pessoal.
            </p>
            
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Escreva aqui suas reflexões sobre o exercício e como ele se relaciona com sua pergunta atual..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-gray-500">
                {reflectionText.length} caracteres • Sem limite de palavras
              </p>
              
              <Button
                onClick={handleSaveReflection}
                disabled={!reflectionText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Registrar Reflexão
              </Button>
            </div>
          </div>

          {/* Saved Reflections */}
          {savedReflections.length > 0 && (
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <h5 className="font-bold text-gray-800">Suas Reflexões Registradas</h5>
                <Badge className="bg-emerald-100 text-emerald-800">{savedReflections.length}</Badge>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {savedReflections.map((reflection) => (
                  <div key={reflection.id} className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="flex justify-between items-start mb-2">
                      <h6 className="font-medium text-gray-800 text-sm">Reflexão - {reflection.exercise}</h6>
                      <span className="text-xs text-gray-500">{reflection.date} às {reflection.time}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{reflection.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Encouragement Message */}
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-5 rounded-lg border border-emerald-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-gray-800 mb-2">Parabéns pelo seu compromisso! 🌟</h5>
                <p className="text-gray-700 leading-relaxed">
                  Cada reflexão registrada é um investimento no seu crescimento pessoal e na qualidade dos seus relacionamentos. 
                  Continue explorando os outros exercícios e aprofundando seu autoconhecimento. Você está no caminho certo!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Relationship Coach Component
export const RelationshipCoach = ({ userId }) => {
  const [isCoachActive, setIsCoachActive] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userChallenge, setUserChallenge] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [userTemperament, setUserTemperament] = useState(null);
  const [partnerTemperament, setPartnerTemperament] = useState('');
  const [insightNotes, setInsightNotes] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [sessionHistory, setSessionHistory] = useState([]);

  // Buscar temperamento do usuário
  useEffect(() => {
    const fetchUserTemperament = async () => {
      try {
        const response = await axios.get(`${API}/users/${userId}`);
        const user = response.data;
        
        // Buscar resultado do questionário de temperamento
        const questionnaireResponse = await axios.get(`${API}/questionnaire/results/${userId}`);
        if (questionnaireResponse.data) {
          setUserTemperament(questionnaireResponse.data.dominant_modality);
        }
      } catch (error) {
        console.error("Error fetching user temperament:", error);
      }
    };

    if (userId) {
      fetchUserTemperament();
    }
  }, [userId]);

  const startCoachSession = () => {
    setIsCoachActive(true);
    setCurrentStep('challenge');
  };

  const handleChallengeSubmit = () => {
    if (userChallenge.trim()) {
      generateCoachResponse();
      setCurrentStep('analysis');
    }
  };

  const generateCoachResponse = () => {
    // Mapear temperamento astrológico para clássico (temporário até ajustar backend)
    const mapToClassicTemperament = (astrologicalTemp) => {
      switch (astrologicalTemp) {
        case 'cardinal': return 'colerico';
        case 'fixed': return 'melancolico';
        case 'mutable': return 'sanguineo';
        default: return 'colerico';
      }
    };

    const userClassicTemperament = mapToClassicTemperament(userTemperament);
    
    // Análise baseada no temperamento clássico do usuário
    let temperamentInsight = '';
    let practicalAdvice = '';
    let compatibilityAnalysis = '';
    
    switch (userClassicTemperament) {
      case 'colerico':
        temperamentInsight = 'Como Colérico, você é naturalmente dominante, decidido e orientado para resultados. Você tende a liderar no relacionamento, mas pode ser impaciente ou controlador.';
        practicalAdvice = 'Pratique a paciência e escuta ativa. Permita que seu parceiro também tome decisões. Pergunte "Como você gostaria de resolver isso?" antes de impor soluções.';
        break;
      case 'melancolico':
        temperamentInsight = 'Seu temperamento Melancólico faz você ser analítico, perfeccionista e profundamente reflexivo. Você valoriza qualidade e profundidade, mas pode ser crítico ou pessimista.';
        practicalAdvice = 'Trabalhe em expressar appreciation pelo seu parceiro. Foque nas qualidades positivas antes de apontar o que precisa melhorar. Pratique gratidão diária.';
        break;
      case 'sanguineo':
        temperamentInsight = 'Como Sanguíneo, você é sociável, otimista e espontâneo. Você traz alegria ao relacionamento, mas pode ser desorganizado ou superficial em questões importantes.';
        practicalAdvice = 'Desenvolva consistência e follow-through. Quando prometer algo ao seu parceiro, cumpra. Crie rotinas que fortaleçam a intimidade além da diversão.';
        break;
      case 'fleumatico':
        temperamentInsight = 'Seu temperamento Fleumático traz calma, diplomacia e estabilidade ao relacionamento. Você é um grande pacificador, mas pode evitar confrontos necessários.';
        practicalAdvice = 'Pratique expressar suas necessidades e limites claramente. Use frases como "Isso é importante para mim porque..." para comunicar sem confronto.';
        break;
      default:
        temperamentInsight = 'Cada temperamento traz características únicas ao relacionamento.';
        practicalAdvice = 'Focamos em desenvolver comunicação empática e compreensão mútua.';
    }

    // Análise de compatibilidade se temperamento do parceiro foi informado
    if (partnerTemperament && partnerTemperament !== 'unknown') {
      const isComplementary = (
        (userClassicTemperament === 'colerico' && partnerTemperament === 'fleumatico') ||
        (userClassicTemperament === 'fleumatico' && partnerTemperament === 'colerico') ||
        (userClassicTemperament === 'sanguineo' && partnerTemperament === 'melancolico') ||
        (userClassicTemperament === 'melancolico' && partnerTemperament === 'sanguineo')
      );

      const isSimilar = userClassicTemperament === partnerTemperament;

      if (isComplementary) {
        compatibilityAnalysis = `

**Análise de Compatibilidade - ALTA/MÉDIA (Bom Equilíbrio):**
Vocês formam uma combinação complementar! Seu temperamento ${getTemperamentName(userClassicTemperament)} equilibra perfeitamente com o ${getTemperamentName(partnerTemperament)} do seu parceiro. Esta dinâmica pode criar um relacionamento muito balanceado, onde suas forças compensam as fraquezas um do outro.`;
      } else if (isSimilar) {
        compatibilityAnalysis = `

**Análise de Compatibilidade - MÉDIA:**
Vocês compartilham o mesmo temperamento ${getTemperamentName(userClassicTemperament)}. Isso significa grande compreensão mútua, mas cuidado para não intensificar os pontos fracos do temperamento. Trabalhem em desenvolver as qualidades que vocês naturalmente não possuem.`;
      } else {
        compatibilityAnalysis = `

**Análise de Compatibilidade - MÉDIA/BAIXA:**
Seu temperamento ${getTemperamentName(userClassicTemperament)} e o ${getTemperamentName(partnerTemperament)} do seu parceiro podem criar alguns desafios, mas também oportunidades de crescimento. O segredo está em valorizar as diferenças e aprender com elas.`;
      }
    }

    const response = `Olá! Como seu Coach de Relacionamento, vou te ajudar a navegar este desafio.

**Análise da Situação:**
${temperamentInsight}${compatibilityAnalysis}

**Estratégia Recomendada:**
${practicalAdvice}

**Reflexões Guiadas:**
• Como você reagiu a esta situação e qual foi o gatilho emocional?
• Que padrões você percebe que se repetem em seu relacionamento?
• Se você fosse seu parceiro, como gostaria de ser abordado nesta situação?
• Como sua personalidade ${getTemperamentName(userClassicTemperament)} influencia esta dinâmica?

**Ação Prática:**
Escolha uma pequena mudança que você pode implementar nos próximos 3 dias para melhorar esta dinâmica, considerando seu perfil ${getTemperamentName(userClassicTemperament)}.`;

    setCoachResponse(response);
  };

  // Função auxiliar para obter nome do temperamento
  const getTemperamentName = (temperament) => {
    const names = {
      'colerico': 'Colérico',
      'melancolico': 'Melancólico',
      'sanguineo': 'Sanguíneo',
      'fleumatico': 'Fleumático'
    };
    return names[temperament] || temperament;
  };

  const saveInsightsAndAction = () => {
    if (insightNotes.trim() || actionPlan.trim()) {
      const session = {
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR'),
        challenge: userChallenge,
        insights: insightNotes,
        actionPlan: actionPlan,
        temperament: userTemperament
      };
      
      setSessionHistory([session, ...sessionHistory]);
      setInsightNotes('');
      setActionPlan('');
      setCurrentStep('completion');
      toast.success("Sessão de coaching registrada com sucesso! 🎯");
    }
  };

  const startNewSession = () => {
    setUserChallenge('');
    setCoachResponse('');
    setInsightNotes('');
    setActionPlan('');
    setCurrentStep('challenge');
  };

  const endCoachSession = () => {
    setIsCoachActive(false);
    setCurrentStep('welcome');
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-full">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-indigo-800">Coach de Relacionamento</CardTitle>
              <CardDescription className="text-indigo-600">
                Orientação personalizada para melhorar seus relacionamentos
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isCoachActive ? (
          // Welcome State
          <div className="text-center space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Heart className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">Bem-vindo ao seu Coach Pessoal!</h4>
              <p className="text-gray-600 leading-relaxed mb-4">
                Receba orientação profissional e estratégias personalizadas para fortalecer seus relacionamentos, 
                baseadas no seu temperamento e padrões comportamentais.
              </p>
              
              {sessionHistory.length > 0 && (
                <div className="mb-4">
                  <Badge className="bg-indigo-100 text-indigo-800">
                    {sessionHistory.length} sessõe{sessionHistory.length > 1 ? 's' : ''} realizadas
                  </Badge>
                </div>
              )}
              
              <Button
                onClick={startCoachSession}
                className="bg-indigo-600 hover:bg-indigo-700 w-full"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Iniciar Sessão de Coaching
              </Button>
            </div>

            {/* Session History */}
            {sessionHistory.length > 0 && (
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  <h5 className="font-bold text-gray-800">Histórico de Sessões</h5>
                </div>
                
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {sessionHistory.slice(0, 3).map((session) => (
                    <div key={session.id} className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-medium text-gray-800 text-sm">Sessão - {session.date}</h6>
                        <span className="text-xs text-gray-500">{session.time}</span>
                      </div>
                      <p className="text-gray-700 text-xs leading-relaxed">
                        {session.challenge.substring(0, 80)}...
                      </p>
                      {session.actionPlan && (
                        <div className="mt-2 text-xs">
                          <Badge className="bg-green-100 text-green-800">Ação definida</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Active Coaching Session
          <div className="space-y-6">
            {currentStep === 'challenge' && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <MessageCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Olá! Vou te ajudar hoje 🤝</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Conte-me sobre a situação ou desafio específico que você está enfrentando no seu relacionamento. 
                      Seja específico e honesto - quanto mais detalhes, melhor posso te orientar.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="challenge" className="font-medium text-gray-800">
                      Descreva sua situação ou desafio:
                    </Label>
                    <textarea
                      id="challenge"
                      value={userChallenge}
                      onChange={(e) => setUserChallenge(e.target.value)}
                      placeholder="Ex: Meu parceiro e eu temos dificuldade em nos comunicar quando há conflitos. Sempre acabamos discutindo ao invés de resolver..."
                      className="w-full h-24 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="partner-temperament" className="font-medium text-gray-800">
                      Se souber, qual o temperamento do seu parceiro?
                    </Label>
                    <Select value={partnerTemperament} onValueChange={setPartnerTemperament}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o temperamento (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="colerico">Colérico - Dominante, decidido</SelectItem>
                        <SelectItem value="melancolico">Melancólico - Analítico, perfeccionista</SelectItem>
                        <SelectItem value="sanguineo">Sanguíneo - Sociável, otimista</SelectItem>
                        <SelectItem value="fleumatico">Fleumático - Calmo, diplomático</SelectItem>
                        <SelectItem value="unknown">Não sei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button
                      onClick={endCoachSession}
                      variant="outline"
                      className="border-gray-300 text-gray-700"
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      onClick={handleChallengeSubmit}
                      disabled={!userChallenge.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Receber Orientação →
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'analysis' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <Brain className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Análise e Orientação Personalizada</h4>
                    </div>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {coachResponse}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <PenTool className="h-5 w-5 text-indigo-600" />
                    <h5 className="font-bold text-gray-800">Registre seus Insights</h5>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="insights" className="font-medium text-gray-800">
                        Principais insights e reflexões:
                      </Label>
                      <textarea
                        id="insights"
                        value={insightNotes}
                        onChange={(e) => setInsightNotes(e.target.value)}
                        placeholder="Anote suas reflexões sobre os padrões identificados, gatilhos emocionais e novos entendimentos..."
                        className="w-full h-20 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="action-plan" className="font-medium text-gray-800">
                        Plano de ação (próximos 3 dias):
                      </Label>
                      <textarea
                        id="action-plan"
                        value={actionPlan}
                        onChange={(e) => setActionPlan(e.target.value)}
                        placeholder="Defina 1-2 ações concretas que você vai implementar nos próximos dias para melhorar esta situação..."
                        className="w-full h-20 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-2"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <Button
                        onClick={startNewSession}
                        variant="outline"
                        className="border-indigo-300 text-indigo-700"
                      >
                        Nova Sessão
                      </Button>
                      
                      <Button
                        onClick={saveInsightsAndAction}
                        disabled={!insightNotes.trim() && !actionPlan.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Sessão
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'completion' && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Sessão Concluída com Sucesso! 🎯</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Excelente trabalho! Você identificou padrões importantes e definiu ações práticas. 
                      Lembre-se: pequenas mudanças consistentes criam grandes transformações nos relacionamentos.
                    </p>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                      <h5 className="font-medium text-gray-800 mb-2">Próximos Passos:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Implemente as ações definidas nos próximos 3 dias</li>
                        <li>• Observe como seu parceiro responde às mudanças</li>
                        <li>• Volte para uma nova sessão se precisar de ajustes</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={startNewSession}
                        variant="outline"
                        className="border-green-300 text-green-700"
                      >
                        Nova Sessão
                      </Button>
                      
                      <Button
                        onClick={endCoachSession}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Finalizar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
// Individual Exercise Cards Component
export const IndividualExerciseCards = ({ userId }) => {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExerciseDetail, setShowExerciseDetail] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [userId]);

  const loadExercises = async () => {
    try {
      const response = await axios.get(`${API}/premium/couple-exercises/${userId}`);
      setExercises(response.data.exercises);
    } catch (error) {
      console.error("Error loading exercises:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openExerciseDetail = (exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseDetail(true);
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  // Define category colors and icons
  const categoryColors = {
    communication: {
      bg: "from-blue-100 to-indigo-100",
      border: "border-blue-200",
      icon: "text-blue-600",
      gradient: "from-blue-50 to-indigo-50"
    },
    conflict_resolution: {
      bg: "from-red-100 to-pink-100", 
      border: "border-red-200",
      icon: "text-red-600",
      gradient: "from-red-50 to-pink-50"
    },
    intimacy: {
      bg: "from-purple-100 to-pink-100",
      border: "border-purple-200", 
      icon: "text-purple-600",
      gradient: "from-purple-50 to-pink-50"
    }
  };

  const categoryIcons = {
    communication: MessageCircle,
    conflict_resolution: Shield,
    intimacy: Heart
  };

  const difficultyConfig = {
    1: { 
      label: "Iniciante", 
      color: "bg-green-100 text-green-800",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200"
    },
    2: { 
      label: "Fácil", 
      color: "bg-blue-100 text-blue-800",
      bgGradient: "from-blue-50 to-sky-50",
      borderColor: "border-blue-200"
    },
    3: { 
      label: "Intermediário", 
      color: "bg-yellow-100 text-yellow-800",
      bgGradient: "from-yellow-50 to-amber-50",
      borderColor: "border-yellow-200"
    },
    4: { 
      label: "Avançado", 
      color: "bg-orange-100 text-orange-800",
      bgGradient: "from-orange-50 to-red-50",
      borderColor: "border-orange-200"
    },
    5: { 
      label: "Super Avançado", 
      color: "bg-red-100 text-red-800",
      bgGradient: "from-red-50 to-rose-50",
      borderColor: "border-red-200"
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
            <Heart className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Exercícios para Casais</h3>
            <p className="text-gray-600">Dinâmicas guiadas para fortalecer sua conexão</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exercises.map((exercise, index) => {
            const colors = categoryColors[exercise.category] || categoryColors.communication;
            const IconComponent = categoryIcons[exercise.category] || MessageCircle;
            const difficulty = difficultyConfig[exercise.difficulty_level] || difficultyConfig[1];
            
            const isLocked = !exercise.is_unlocked;
            const isCompleted = exercise.is_completed;

            return (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isLocked 
                    ? 'border-2 border-gray-200 bg-gray-50 opacity-75' 
                    : `border-2 ${difficulty.borderColor} bg-gradient-to-br ${difficulty.bgGradient}`
                }`}
              >
                <CardContent className="p-6">
                  {/* Header with Icon and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isLocked ? 'bg-gray-200' : `bg-gradient-to-r ${colors.bg}`}`}>
                      {isLocked ? (
                        <Lock className="h-6 w-6 text-gray-400" />
                      ) : (
                        <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Completo</span>
                        </div>
                      )}
                      {isLocked && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Lock className="h-4 w-4" />
                          <span className="text-xs font-medium">Bloqueado</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="mb-4">
                    <h4 className={`text-lg font-bold mb-2 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                      {exercise.title}
                    </h4>
                    <p className={`text-sm leading-relaxed ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isLocked 
                        ? 'Complete o exercício anterior com feedback para desbloquear'
                        : exercise.description
                      }
                    </p>
                  </div>

                  {/* Meta Information */}
                  <div className="space-y-3 mb-4">
                    <Badge className={difficulty.color}>{difficulty.label}</Badge>
                    
                    {!isLocked && (
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          <span>{exercise.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{exercise.expected_outcomes.length} resultados</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => openExerciseDetail(exercise)}
                    disabled={isLocked}
                    className={`w-full ${
                      isLocked 
                        ? "bg-gray-300 cursor-not-allowed hover:bg-gray-300" 
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Bloqueado
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Ver Novamente
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Começar Exercício
                      </>
                    )}
                  </Button>

                  {/* Progress Indicator for Locked Items */}
                  {isLocked && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-500">
                        Complete o nível {exercise.difficulty_level - 1} primeiro
                      </p>
                    </div>
                  )}
                </CardContent>

                {/* Completion Badge Overlay */}
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      ✓
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Exercise Detail Dialog */}
      {showExerciseDetail && selectedExercise && (
        <Dialog open={showExerciseDetail} onOpenChange={setShowExerciseDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Heart className="h-6 w-6 text-purple-600" />
                {selectedExercise.title}
              </DialogTitle>
              <DialogDescription className="text-lg">
                {selectedExercise.description}
              </DialogDescription>
            </DialogHeader>
            
            <ExerciseDetailContent 
              exercise={selectedExercise} 
              userId={userId}
              onComplete={() => {
                setShowExerciseDetail(false);
                loadExercises(); // Reload to update progress
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Main Enhanced Premium Component
export const AdvancedPremiumHub = ({ userId, isPremium = false }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [userAchievements, setUserAchievements] = useState([]);

  const sections = [
    { 
      id: 'overview', 
      title: 'Visão Geral', 
      icon: Target, 
      description: 'Dashboard de suas conquistas e progresso'
    },
    { 
      id: 'couple-exercises', 
      title: 'Exercícios para Casais', 
      icon: Heart, 
      description: 'Fortaleça sua conexão através de exercícios práticos',
      premium: false // First exercise free
    },
    { 
      id: 'temperament-questionnaire', 
      title: 'Questionário de Temperamento', 
      icon: Brain, 
      description: 'Descubra seu perfil de temperamento com 6 perguntas',
      premium: false
    },
    { 
      id: 'advanced-compatibility', 
      title: 'Compatibilidade Avançada', 
      icon: Users, 
      description: 'Análise detalhada da dinâmica do casal',
      premium: true
    },
    { 
      id: 'detailed-profile', 
      title: 'Perfil Detalhado Premium', 
      icon: Crown, 
      description: 'Análise profunda do seu temperamento',
      premium: true
    }
  ];

  const loadUserAchievements = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}/exercise-completions`);
      setUserAchievements(response.data.completions || []);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  useEffect(() => {
    loadUserAchievements();
  }, [userId]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'couple-exercises':
        return <CoupleExercises userId={userId} isPremium={isPremium} />;
      
      case 'temperament-questionnaire':
        return (
          <EnhancedTemperamentQuestionnaire 
            userId={userId} 
            isPremium={isPremium}
            onComplete={(result) => {
              toast.success('Questionário completado com sucesso!');
              // Could redirect to detailed profile if premium
            }}
          />
        );
      
      case 'advanced-compatibility':
        return <AdvancedCompatibilityReport userId={userId} isPremium={isPremium} />;
      
      case 'detailed-profile':
        return <DetailedTemperamentProfile userId={userId} isPremium={isPremium} />;
      
      default:
        return (
          <div className="space-y-6">
            {/* Overview Dashboard */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Área Premium Avançada
              </h2>
              <p className="text-gray-600">
                Explore funcionalidades exclusivas para aprofundar seu autoconhecimento
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-pink-600 mb-2">
                    {userAchievements.length}
                  </div>
                  <p className="text-gray-600">Exercícios Completados</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {isPremium ? '100%' : '25%'}
                  </div>
                  <p className="text-gray-600">Funcionalidades Disponíveis</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {isPremium ? 'Premium' : 'Free'}
                  </div>
                  <p className="text-gray-600">Status da Conta</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            {userAchievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Conquistas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userAchievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">
                            Exercício Completado
                          </p>
                          <p className="text-sm text-green-600">
                            {new Date(achievement.completed_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Passos Recomendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setActiveSection('temperament-questionnaire')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 h-auto"
                  >
                    <div className="text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Descobrir Temperamento</div>
                      <div className="text-sm opacity-90">6 perguntas personalizadas</div>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveSection('couple-exercises')}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 h-auto"
                  >
                    <div className="text-center">
                      <Heart className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-semibold">Exercícios de Casal</div>
                      <div className="text-sm opacity-90">Fortaleça sua conexão</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {sections.map(section => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              const isLocked = section.premium && !isPremium;
              
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    if (isLocked) {
                      toast.info('Faça upgrade para Premium para acessar esta funcionalidade!');
                      return;
                    }
                    setActiveSection(section.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-pink-500 text-pink-600'
                      : isLocked
                      ? 'border-transparent text-gray-400 hover:text-gray-500'  
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{section.title}</span>
                  {isLocked && <Lock className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderActiveSection()}
      </div>
    </div>
  );
};
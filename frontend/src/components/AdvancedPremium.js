import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { 
  BookOpen, Target, Trophy, Star, Crown, Award, Calendar, CheckCircle, Lock, Download,
  Heart, Brain, Zap, Shield, Users, MessageCircle, Lightbulb, TrendingUp, Map, Timer
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Enhanced Temperament Profile with Deep Insights
export const EnhancedTemperamentProfile = ({ modality, isPreview = false }) => {
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
              {profile.title}
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
              Upgrade Premium - R$ 12
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
      const response = await axios.get(`${API}/premium/couple-exercises`);
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
          const difficulty = difficultyLabels[exercise.difficulty_level] || difficultyLabels[1];

          return (
            <Card key={index} className={`border-2 ${colors.border} hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 bg-gradient-to-r ${colors.bg} rounded-lg`}>
                        <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">{exercise.title}</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">{exercise.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={difficulty.color}>{difficulty.label}</Badge>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Timer className="h-4 w-4" />
                        <span>{exercise.duration_minutes} min</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {exercise.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{exercise.expected_outcomes.length}</span> resultados esperados
                  </div>
                  <Button
                    onClick={() => openExerciseDetail(exercise)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Ver Detalhes
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
            
            <ExerciseDetailContent exercise={selectedExercise} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Exercise Detail Content
const ExerciseDetailContent = ({ exercise }) => {
  const colors = {
    communication: "from-blue-50 to-indigo-50",
    conflict_resolution: "from-red-50 to-pink-50", 
    intimacy: "from-purple-50 to-pink-50"
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
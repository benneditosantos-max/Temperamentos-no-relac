import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Heart, 
  MessageSquare, 
  Map, 
  Home, 
  CheckCircle, 
  Lock,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const CoupleExercises = ({ userId, isPremium = false }) => {
  const [exercises, setExercises] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [completedExercises, setCompletedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exerciseDetails, setExerciseDetails] = useState(null);
  const [saving, setSaving] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const exerciseIcons = {
    'ritual_conexao_diaria': Heart,
    'roleplay_resolucao_conflitos': MessageSquare,
    'mapa_intimidade': Map,
    'arquitetura_vida_compartilhada': Home
  };

  const exerciseColors = {
    'ritual_conexao_diaria': 'from-pink-500 to-rose-500',
    'roleplay_resolucao_conflitos': 'from-blue-500 to-indigo-500',
    'mapa_intimidade': 'from-purple-500 to-violet-500',
    'arquitetura_vida_compartilhada': 'from-green-500 to-emerald-500'
  };

  useEffect(() => {
    loadExercises();
    loadCompletedExercises();
  }, [userId]);

  const loadExercises = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/couple-exercises`);
      // Backend returns list format, convert to object format for compatibility
      const exercisesObj = {};
      response.data.forEach(exercise => {
        exercisesObj[exercise.type] = {
          title: exercise.title,
          description: exercise.description,
          questions_count: exercise.questions_count
        };
      });
      setExercises(exercisesObj);
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast.error('Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedExercises = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/users/${userId}/exercise-completions`);
      // Backend returns direct array now
      setCompletedExercises(response.data.map(c => c.exercise_type));
    } catch (error) {
      console.error('Error loading completed exercises:', error);
    }
  };

  const loadExerciseResponses = async (exerciseType) => {
    try {
      const response = await axios.get(`${backendUrl}/api/users/${userId}/exercise-responses/${exerciseType}`);
      const exerciseResponses = {};
      // Backend returns direct array now
      response.data.forEach(resp => {
        exerciseResponses[resp.question_index] = resp.response_text;
      });
      setResponses(exerciseResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const saveResponse = async (exerciseType, questionIndex, responseText) => {
    if (!responseText.trim()) return;

    setSaving(true);
    try {
      await axios.post(`${backendUrl}/api/users/${userId}/exercise-responses`, {
        exercise_type: exerciseType,
        question_index: questionIndex,
        response_text: responseText
      });
      
      setResponses(prev => ({
        ...prev,
        [questionIndex]: responseText
      }));
      
      toast.success('Resposta salva!');
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Erro ao salvar resposta');
    } finally {
      setSaving(false);
    }
  };

  const completeExercise = async (exerciseType) => {
    try {
      await axios.post(`${backendUrl}/api/users/${userId}/complete-exercise/${exerciseType}`);
      setCompletedExercises(prev => [...prev, exerciseType]);
      toast.success('🎉 Exercício concluído! Parabéns pelo seu crescimento!');
    } catch (error) {
      console.error('Error completing exercise:', error);
      if (error.response?.status === 400) {
        toast.error('Complete todas as perguntas antes de finalizar o exercício');
      } else {
        toast.error('Erro ao finalizar exercício');
      }
    }
  };

  const loadExerciseDetails = async (exerciseType) => {
    try {
      const response = await axios.get(`${backendUrl}/api/couple-exercises/${exerciseType}`);
      setExerciseDetails(response.data);
    } catch (error) {
      console.error('Error loading exercise details:', error);
      toast.error('Erro ao carregar detalhes do exercício');
    }
  };

  const openExercise = (exerciseType) => {
    setSelectedExercise(exerciseType);
    setCurrentQuestionIndex(0);
    loadExerciseDetails(exerciseType);
    loadExerciseResponses(exerciseType);
  };

  const closeExercise = () => {
    setSelectedExercise(null);
    setCurrentQuestionIndex(0);
    setResponses({});
    setExerciseDetails(null);
  };

  const getCompletionPercentage = (exerciseType) => {
    if (!exercises[exerciseType]) return 0;
    const totalQuestions = exercises[exerciseType].questions_count || 6;
    const completedQuestions = Object.keys(responses).length;
    return Math.round((completedQuestions / totalQuestions) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Exercise List View
  if (!selectedExercise) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Exercícios para Casais
          </h2>
          <p className="text-gray-600">
            Fortaleçam sua conexão através de exercícios práticos e reflexões profundas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(exercises).map(([exerciseType, exerciseData]) => {
            const IconComponent = exerciseIcons[exerciseType] || Heart;
            const isCompleted = completedExercises.includes(exerciseType);
            const isLocked = !isPremium && exerciseType !== 'ritual_conexao_diaria'; // First exercise free

            return (
              <Card 
                key={exerciseType} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  isLocked ? 'opacity-60' : 'hover:scale-105'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${exerciseColors[exerciseType]} opacity-5`} />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${exerciseColors[exerciseType]} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{exerciseData.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {exerciseData.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {isLocked && (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    
                    {isCompleted && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{exerciseData.questions_count || 6} perguntas</span>
                        <span>{isCompleted ? '100%' : '0%'} completo</span>
                      </div>
                      <Progress 
                        value={isCompleted ? 100 : 0} 
                        className="h-2"
                      />
                    </div>

                    {isLocked ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                        onClick={() => toast.info('Faça upgrade para Premium para acessar todos os exercícios!')}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Upgrade para Premium
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => openExercise(exerciseType)}
                        className={`w-full bg-gradient-to-r ${exerciseColors[exerciseType]} text-white`}
                      >
                        {isCompleted ? 'Revisar Exercício' : 'Iniciar Exercício'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Exercise Detail View - wait for exercise details to load
  if (!exerciseDetails) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const currentQuestion = exerciseDetails.questions[currentQuestionIndex];
  const totalQuestions = exerciseDetails.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentResponse = responses[currentQuestionIndex] || '';
  const completionPercentage = getCompletionPercentage(selectedExercise);
  const isCompleted = completedExercises.includes(selectedExercise);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={closeExercise}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos Exercícios
        </Button>
        
        <Badge variant="secondary" className="text-sm">
          Pergunta {currentQuestionIndex + 1} de {totalQuestions}
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {exerciseDetails.title}
            </h2>
            {isCompleted && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                Exercício Concluído
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso do exercício</span>
              <span>{completionPercentage}% completo</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {currentQuestion}
              </h3>
              
              <Textarea
                value={currentResponse}
                onChange={(e) => {
                  setResponses(prev => ({
                    ...prev,
                    [currentQuestionIndex]: e.target.value
                  }));
                }}
                placeholder="Escreva sua resposta aqui..."
                className="min-h-[200px] text-base leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => saveResponse(selectedExercise, currentQuestionIndex, currentResponse)}
                disabled={saving || !currentResponse.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Resposta'}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={isFirstQuestion}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                <Button
                  onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                  disabled={isLastQuestion}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                >
                  Próxima
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Exercise */}
      {completionPercentage === 100 && !isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              🎉 Todas as perguntas respondidas!
            </h3>
            <p className="text-green-700 mb-4">
              Você completou todas as reflexões deste exercício. Finalize para adicionar às suas conquistas!
            </p>
            <Button
              onClick={() => completeExercise(selectedExercise)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Exercício
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoupleExercises;
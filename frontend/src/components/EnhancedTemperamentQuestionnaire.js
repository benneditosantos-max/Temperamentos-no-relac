import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Brain, 
  CheckCircle, 
  Crown,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Star
} from 'lucide-react';

const EnhancedTemperamentQuestionnaire = ({ userId, isPremium = false, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const temperamentColors = {
    colerico: 'from-red-500 to-orange-500',
    sanguineo: 'from-yellow-500 to-orange-500',
    melancolico: 'from-blue-500 to-indigo-500',
    fleumatico: 'from-green-500 to-teal-500'
  };

  const temperamentNames = {
    colerico: 'Colérico',
    sanguineo: 'Sanguíneo',
    melancolico: 'Melancólico',
    fleumatico: 'Fleumático'
  };

  const temperamentDescriptions = {
    colerico: 'Líder natural, determinado e orientado a resultados',
    sanguineo: 'Sociável, otimista e cheio de energia',
    melancolico: 'Profundo, leal e focado na qualidade',
    fleumatico: 'Pacífico, estável e mediador natural'
  };

  useEffect(() => {
    loadQuestionnaire();
  }, []);

  const loadQuestionnaire = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/temperament-questionnaire`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      toast.error('Erro ao carregar questionário');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const submitQuestionnaire = async () => {
    const answersArray = questions.map(q => ({
      question_id: q.id,
      selected_option: answers[q.id]
    }));

    if (answersArray.some(a => !a.selected_option)) {
      toast.error('Por favor, responda todas as perguntas');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/users/${userId}/temperament-questionnaire`,
        { answers: answersArray }
      );
      
      setResult(response.data);
      setShowResult(true);
      
      if (onComplete) {
        onComplete(response.data);
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast.error('Erro ao processar respostas');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length;
    return Math.round((answeredQuestions / questions.length) * 100);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Result View
  if (showResult && result) {
    const temperamentKey = result.dominant_temperament;
    const temperamentColor = temperamentColors[temperamentKey];
    const temperamentName = temperamentNames[temperamentKey];
    const temperamentDesc = temperamentDescriptions[temperamentKey];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Seu Temperamento Descoberto!
          </h2>
          <p className="text-gray-600">
            Baseado em suas respostas, identificamos seu perfil dominante
          </p>
        </div>

        {/* Main Result */}
        <Card className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${temperamentColor}`} />
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${temperamentColor} flex items-center justify-center`}>
                <Brain className="h-12 w-12 text-white" />
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {temperamentName}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {temperamentDesc}
                </p>
                <Badge className={`bg-gradient-to-r ${temperamentColor} text-white text-lg px-4 py-2`}>
                  {result.temperament_percentage}% dominante
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practical Tip */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-full">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">
                  💡 Dica Prática Personalizada
                </h4>
                <p className="text-blue-700 leading-relaxed">
                  {result.practical_tip}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temperament Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Distribuição dos Temperamentos
            </CardTitle>
            <CardDescription>
              Como seus temperamentos se combinam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(result.scores).map(([tempKey, score]) => {
                const percentage = Math.round((score / Object.values(result.scores).reduce((a, b) => a + b, 0)) * 100);
                const color = temperamentColors[tempKey];
                
                return (
                  <div key={tempKey} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {temperamentNames[tempKey]}
                      </span>
                      <span className="text-sm text-gray-600">
                        {percentage}%
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-3"
                      style={{
                        background: `linear-gradient(to right, ${color.split(' ')[1]}, ${color.split(' ')[3]})`
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Premium CTA */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    {isPremium ? '✨ Análise Premium Disponível' : '🔓 Desbloqueie Análise Completa'}
                  </h4>
                  <p className="text-yellow-700 text-sm leading-relaxed">
                    {isPremium 
                      ? 'Acesse sua análise profunda com insights detalhados, padrões de relacionamento e recomendações personalizadas.'
                      : 'Veja análise profunda do seu temperamento, compatibilidade com parceiros, estratégias de comunicação e muito mais!'
                    }
                  </p>
                </div>
              </div>
              
              <Button 
                className={`${isPremium 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                } text-white`}
                onClick={() => {
                  if (isPremium) {
                    // Navigate to detailed profile
                    toast.info('Redirecionando para análise completa...');
                  } else {
                    toast.info('Faça upgrade para Premium para acessar análise completa!');
                  }
                }}
              >
                {isPremium ? 'Ver Análise Completa' : 'Upgrade Premium'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => {
              setShowResult(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setResult(null);
            }}
          >
            Refazer Questionário
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
            onClick={() => {
              if (onComplete) {
                onComplete(result);
              }
            }}
          >
            Continuar Jornada
          </Button>
        </div>
      </div>
    );
  }

  // Questionnaire View
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentAnswer = answers[currentQuestion?.id];
  const progressPercentage = getProgressPercentage();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Questionário de Temperamento
        </h2>
        <p className="text-gray-600">
          Descubra seu perfil de temperamento através de 6 perguntas cuidadosamente elaboradas
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                Pergunta {currentQuestionIndex + 1} de {questions.length}
              </h3>
              <Badge variant="secondary">
                {progressPercentage}% concluído
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {currentQuestion?.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
            className="space-y-4"
          >
            {currentQuestion?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem 
                  value={option.text} 
                  id={`option-${index}`}
                  className="text-pink-500"
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer text-gray-700 leading-relaxed"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-pink-500'
                  : answers[questions[index]?.id]
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {isLastQuestion ? (
          <Button
            onClick={submitQuestionnaire}
            disabled={submitting || !currentAnswer}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {submitting ? 'Processando...' : 'Ver Resultado'}
          </Button>
        ) : (
          <Button
            onClick={goToNextQuestion}
            disabled={!currentAnswer}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center gap-2"
          >
            Próxima
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedTemperamentQuestionnaire;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Crown, 
  Brain, 
  MessageCircle, 
  Shield, 
  Heart,
  TrendingUp,
  Lightbulb,
  Download,
  Share2,
  Lock,
  Star,
  Target,
  Users
} from 'lucide-react';

const DetailedTemperamentProfile = ({ userId, isPremium = false }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (isPremium) {
      loadProfile();
    }
  }, [userId, isPremium]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/users/${userId}/detailed-temperament-profile`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 403) {
        setError('premium_required');
      } else if (error.response?.status === 400) {
        setError('questionnaire_required');
      } else {
        setError('general_error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Premium Required View
  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Perfil Detalhado Premium
          </h2>
          <p className="text-gray-600">
            Análise profunda do seu temperamento com insights personalizados
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500" />
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Crown className="h-12 w-12 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Funcionalidade Premium Bloqueada
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  O perfil detalhado oferece análise profunda do seu temperamento, 
                  com correções refinadas, padrões de relacionamento, estilos de comunicação 
                  e recomendações personalizadas.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: Brain, title: 'Análise Profunda', desc: 'Insights detalhados do seu temperamento' },
                  { icon: MessageCircle, title: 'Estilo de Comunicação', desc: 'Como você se expressa em relacionamentos' },
                  { icon: Shield, title: 'Resolução de Conflitos', desc: 'Seu padrão natural para lidar com desafios' },
                  { icon: Heart, title: 'Preferências de Intimidade', desc: 'Como você expressa e recebe amor' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg opacity-60">
                    <feature.icon className="h-6 w-6 text-gray-400" />
                    <div className="text-left">
                      <h4 className="font-medium text-gray-700">{feature.title}</h4>
                      <p className="text-sm text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 text-lg"
                onClick={() => toast.info('Faça upgrade para Premium para acessar perfil detalhado!')}
              >
                <Crown className="h-5 w-5 mr-2" />
                Upgrade para Premium
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Error States
  if (error === 'questionnaire_required') {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">
              Questionário de Temperamento Necessário
            </h3>
            <p className="text-yellow-700 mb-4">
              Complete o questionário de temperamento para gerar seu perfil detalhado.
            </p>
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              Fazer Questionário
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              Erro ao Carregar Perfil
            </h3>
            <p className="text-red-700 mb-4">
              Não foi possível carregar seu perfil detalhado. Tente novamente.
            </p>
            <Button onClick={loadProfile} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const temperamentKey = profile.dominant_temperament;
  const temperamentColor = temperamentColors[temperamentKey];
  const temperamentName = temperamentNames[temperamentKey];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Perfil Detalhado Premium
        </h2>
        <p className="text-gray-600">
          Análise profunda e personalizada do seu temperamento
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <div className={`h-3 bg-gradient-to-r ${temperamentColor}`} />
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className={`mx-auto w-32 h-32 rounded-full bg-gradient-to-br ${temperamentColor} flex items-center justify-center mb-4`}>
                <Brain className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {temperamentName}
              </h3>
              <p className="text-gray-600">Temperamento Dominante</p>
            </div>

            <div className="col-span-2 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">
                  Distribuição de Temperamentos
                </h4>
                <div className="space-y-3">
                  {Object.entries(profile.temperament_percentages).map(([tempKey, percentage]) => {
                    const color = temperamentColors[tempKey];
                    const name = temperamentNames[tempKey];
                    const displayPercentage = Math.round(percentage);
                    
                    return (
                      <div key={tempKey} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">{name}</span>
                          <Badge className={`bg-gradient-to-r ${color} text-white`}>
                            {displayPercentage}%
                          </Badge>
                        </div>
                        <Progress value={displayPercentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deep Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Lightbulb className="h-5 w-5" />
            Insights Profundos
          </CardTitle>
          <CardDescription className="text-blue-700">
            Análise refinada baseada em padrões comportamentais avançados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.deep_insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-blue-800 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Estilo de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Seu Estilo</h4>
              <p className="text-gray-600">{profile.communication_style.style}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Pontos Fortes</h4>
              <p className="text-gray-600">{profile.communication_style.strengths}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Área de Desenvolvimento</h4>
              <p className="text-gray-600">{profile.communication_style.areas_to_develop}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Patterns */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Users className="h-5 w-5" />
            Padrões de Relacionamento
          </CardTitle>
          <CardDescription className="text-purple-700">
            Como você naturalmente se comporta em relacionamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.relationship_patterns.map((pattern, index) => (
              <div key={index} className="flex items-start gap-3">
                <Star className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-purple-800">{pattern}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Recommendations */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            Recomendações de Crescimento
          </CardTitle>
          <CardDescription className="text-green-700">
            Áreas específicas para desenvolvimento pessoal e relacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.growth_recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Tips */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Lightbulb className="h-5 w-5" />
            Dicas Personalizadas
          </CardTitle>
          <CardDescription className="text-orange-700">
            Conselhos práticos baseados no seu perfil único
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profile.personalized_tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">
                  💡
                </div>
                <p className="text-orange-800">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Partner Compatibility Preview */}
      {profile.partner_compatibility_preview && (
        <Card className="border-pink-200 bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-800">
              <Heart className="h-5 w-5" />
              Preview de Compatibilidade
            </CardTitle>
            <CardDescription className="text-pink-700">
              Como seu temperamento se relaciona com parceiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-pink-800">
              Complete a análise de compatibilidade para ver insights detalhados 
              sobre como seu temperamento se conecta com diferentes perfis.
            </p>
            <Button 
              className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
              onClick={() => toast.info('Acesse a seção de Compatibilidade Avançada!')}
            >
              Analisar Compatibilidade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => toast.info('Funcionalidade de PDF em desenvolvimento!')}
        >
          <Download className="h-4 w-4" />
          Baixar Relatório PDF
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => toast.info('Compartilhe seus insights com seu parceiro!')}
        >
          <Share2 className="h-4 w-4" />
          Compartilhar Perfil
        </Button>
        <Button 
          onClick={loadProfile}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
        >
          Atualizar Análise
        </Button>
      </div>

      {/* Premium Badge */}
      <div className="text-center">
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2">
          <Crown className="h-4 w-4 mr-2" />
          Análise Premium Ativa
        </Badge>
      </div>
    </div>
  );
};

export default DetailedTemperamentProfile;
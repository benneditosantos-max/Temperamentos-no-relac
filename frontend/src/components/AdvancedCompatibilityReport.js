import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Heart, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle, 
  Crown,
  Lock,
  Download,
  Share2,
  Lightbulb
} from 'lucide-react';

const AdvancedCompatibilityReport = ({ userId, isPremium = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    partnerName: '',
    partnerTemperament: ''
  });
  const [report, setReport] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const temperamentOptions = [
    { value: 'colerico', label: 'Colérico - Líder natural e determinado' },
    { value: 'sanguineo', label: 'Sanguíneo - Sociável e otimista' },
    { value: 'melancolico', label: 'Melancólico - Profundo e leal' },
    { value: 'fleumatico', label: 'Fleumático - Pacífico e estável' }
  ];

  const compatibilityAreas = [
    { key: 'temperament_compatibility', label: 'Temperamentos', icon: Users },
    { key: 'intimacy_compatibility', label: 'Intimidade', icon: Heart },
    { key: 'conflict_resolution_compatibility', label: 'Resolução de Conflitos', icon: Target },
    { key: 'shared_life_compatibility', label: 'Vida Compartilhada', icon: TrendingUp },
    { key: 'achievements_compatibility', label: 'Conquistas', icon: CheckCircle }
  ];

  useEffect(() => {
    loadPreview();
  }, [userId]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/users/${userId}/advanced-compatibility-preview`);
      setPreview(response.data);
    } catch (error) {
      console.error('Error loading preview:', error);
      if (error.response?.status === 400) {
        toast.info('Complete o questionário de temperamento primeiro para ver a compatibilidade');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAdvancedReport = async () => {
    if (!formData.partnerName.trim()) {
      toast.error('Por favor, digite o nome do seu parceiro');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${backendUrl}/api/users/${userId}/advanced-compatibility`, {
        partner_name: formData.partnerName,
        partner_temperament: formData.partnerTemperament || null
      });
      
      setReport(response.data);
      setShowForm(false);
      toast.success('🎉 Relatório de compatibilidade gerado com sucesso!');
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.response?.status === 400) {
        toast.error('Complete o questionário de temperamento primeiro');
      } else if (error.response?.status === 403) {
        toast.error('Esta funcionalidade é exclusiva para usuários Premium');
      } else {
        toast.error('Erro ao gerar relatório');
      }
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    return 'Desafiadora';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Form View
  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Analisar Compatibilidade do Casal
          </h2>
          <p className="text-gray-600">
            Descubra como seus temperamentos se conectam e complementam
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Informações do Parceiro
            </CardTitle>
            <CardDescription>
              Preencha os dados para gerar a análise de compatibilidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="partnerName">Nome do seu parceiro(a)</Label>
              <Input
                id="partnerName"
                value={formData.partnerName}
                onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                placeholder="Digite o nome do seu parceiro"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="partnerTemperament">
                Temperamento do parceiro (opcional)
              </Label>
              <Select
                value={formData.partnerTemperament}
                onValueChange={(value) => setFormData(prev => ({ ...prev, partnerTemperament: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione se souber o temperamento" />
                </SelectTrigger>
                <SelectContent>
                  {temperamentOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                Se não souber, faremos uma análise baseada em padrões gerais
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={generateAdvancedReport}
                disabled={generating}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
              >
                {generating ? 'Gerando...' : 'Gerar Análise'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full Report View (Premium)
  if (report && isPremium) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Relatório de Compatibilidade Avançada
          </h2>
          <p className="text-gray-600">
            Análise completa da dinâmica entre você e {report.partner_name}
          </p>
        </div>

        {/* Overall Score */}
        <Card className="overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${
            report.overall_score >= 80 ? 'from-green-500 to-emerald-500' :
            report.overall_score >= 60 ? 'from-yellow-500 to-orange-500' :
            'from-red-500 to-rose-500'
          }`} />
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className={`text-6xl font-bold ${
                  report.overall_score >= 80 ? 'text-green-600' :
                  report.overall_score >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {report.overall_score}
                </div>
                <div className="text-2xl text-gray-500 ml-2">/ 100</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Compatibilidade {getScoreLabel(report.overall_score)}
                </h3>
                <p className="text-lg text-gray-600">
                  Pontuação geral da dinâmica do casal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Áreas</CardTitle>
            <CardDescription>
              Como vocês se conectam em diferentes aspectos do relacionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {compatibilityAreas.map(area => {
                const score = report[area.key];
                const IconComponent = area.icon;
                
                return (
                  <div key={area.key} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getScoreColor(score)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {area.label}
                          </span>
                          <Badge className={getScoreColor(score)}>
                            {score}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Pontos Fortes da Relação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800">{strength}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Desafios e Oportunidades de Crescimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800">{challenge}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              Plano de Ação Personalizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.action_plan.map((action, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-blue-800">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
          >
            Nova Análise
          </Button>
        </div>
      </div>
    );
  }

  // Preview View (Free users or no report yet)
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Compatibilidade Avançada
        </h2>
        <p className="text-gray-600">
          Descubra como você e seu parceiro se conectam em múltiplas dimensões
        </p>
      </div>

      {/* Preview Card */}
      {preview && (
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500" />
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="text-5xl font-bold text-pink-600">
                  {preview.overall_score}
                </div>
                <div className="text-xl text-gray-500 ml-2">/ 100</div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Preview da Sua Compatibilidade
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {preview.preview_message}
                </p>
              </div>

              {!isPremium && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <Lock className="h-8 w-8 text-yellow-500" />
                    <div className="text-left">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        🔓 Desbloqueie Análise Completa
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        {preview.upgrade_message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA Button */}
      <div className="text-center">
        <Button
          onClick={() => {
            if (isPremium) {
              setShowForm(true);
            } else {
              toast.info('Faça upgrade para Premium para acessar análise completa!');
            }
          }}
          className={`${
            isPremium 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
          } text-white px-8 py-4 text-lg`}
        >
          {isPremium ? (
            <>
              <Users className="h-5 w-5 mr-2" />
              Analisar Casal
            </>
          ) : (
            <>
              <Crown className="h-5 w-5 mr-2" />
              Upgrade para Premium
            </>
          )}
        </Button>
      </div>

      {/* Feature Preview */}
      <div className="grid md:grid-cols-2 gap-4">
        {compatibilityAreas.map(area => {
          const IconComponent = area.icon;
          return (
            <Card key={area.key} className={`${!isPremium ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {area.label}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {!isPremium ? 'Premium' : 'Incluído'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedCompatibilityReport;
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from "sonner";
import { 
  MessageCircleHeart, Share2, Download, Copy, 
  MessageCircle, Send, Mail, Instagram, Phone,
  Heart, Sparkles, Users, Crown
} from 'lucide-react';
import html2canvas from 'html2canvas';

export const ShareableCard = ({ 
  userTemperament, 
  partnerTemperament, 
  compatibility, 
  isPremium = false, 
  userName = "Você",
  partnerName = "Seu amor"
}) => {
  const cardRef = useRef(null);

  const getTemperamentColor = (temperament) => {
    switch (temperament?.toLowerCase()) {
      case 'colérico': return 'from-red-500 to-orange-500';
      case 'melancólico': return 'from-blue-500 to-indigo-500';
      case 'sanguíneo': return 'from-yellow-500 to-orange-500';
      case 'fleumático': return 'from-green-500 to-teal-500';
      default: return 'from-pink-500 to-rose-500';
    }
  };

  const getElement = (temperament) => {
    switch (temperament?.toLowerCase()) {
      case 'colérico': return 'Fogo';
      case 'melancólico': return 'Terra';
      case 'sanguíneo': return 'Ar';
      case 'fleumático': return 'Água';
      default: return 'Elemento';
    }
  };

  const getCompatibilityMessage = (score) => {
    if (score >= 80) return "Vocês são almas gêmeas, uma conexão rara e especial! ✨";
    if (score >= 70) return "Vocês têm paixão e energia, mas precisam alinhar forças 🔥";
    if (score >= 60) return "Uma combinação interessante com muito potencial para crescer 💕";
    if (score >= 50) return "Diferenças que podem se complementar lindamente 🌟";
    return "Cada relacionamento é único, descubram juntos sua magia! 💝";
  };

  const getPremiumInsights = () => {
    return {
      strengths: "Comunicação natural e objetivos alinhados",
      challenges: "Gerenciar diferenças de ritmo e intensidade",
      suggestion: "Pratiquem momentos de qualidade sem distrações"
    };
  };

  return (
    <div 
      ref={cardRef}
      className="w-96 bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl shadow-2xl border border-pink-200"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header com ícones de coração */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
          <Users className="h-6 w-6 text-rose-500" />
          <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
        </div>
      </div>

      {/* Título */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Compatibilidade Descoberta
        </h2>
        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
            {compatibility?.score || 75}% de Afinidade
          </Badge>
        </div>
      </div>

      {/* Temperamentos */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className={`bg-gradient-to-r ${getTemperamentColor(userTemperament)} p-3 rounded-xl mb-2`}>
            <div className="text-white font-semibold text-sm">
              {userName}
            </div>
            <div className="text-white text-xs opacity-90">
              {userTemperament} • {getElement(userTemperament)}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className={`bg-gradient-to-r ${getTemperamentColor(partnerTemperament)} p-3 rounded-xl mb-2`}>
            <div className="text-white font-semibold text-sm">
              {partnerName}
            </div>
            <div className="text-white text-xs opacity-90">
              {partnerTemperament} • {getElement(partnerTemperament)}
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de compatibilidade */}
      <div className="text-center mb-6">
        <p className="text-gray-700 text-sm font-medium leading-relaxed">
          {getCompatibilityMessage(compatibility?.score || 75)}
        </p>
      </div>

      {/* Insights Premium */}
      {isPremium && (
        <div className="bg-white/50 rounded-xl p-4 mb-6 border border-pink-200">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-semibold text-gray-700">ANÁLISE PREMIUM</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <p><strong>Pontos Fortes:</strong> {getPremiumInsights().strengths}</p>
            <p><strong>Desafios:</strong> {getPremiumInsights().challenges}</p>
            <p><strong>Sugestão:</strong> {getPremiumInsights().suggestion}</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-xl text-white">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-4 w-4" />
          <span className="font-semibold text-sm">Amor & Temperamentos</span>
        </div>
        <p className="text-xs opacity-90">
          Descubra sua compatibilidade completa no app
        </p>
      </div>

      {/* Rodapé */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Criado com 💕 • temperamentos.app
        </p>
      </div>
    </div>
  );
};

export const ShareWithPartnerModal = ({ 
  open, 
  onOpenChange, 
  userTemperament, 
  partnerTemperament, 
  compatibility,
  isPremium = false,
  userName = "Você",
  partnerName = "Seu amor"
}) => {
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [cardImage, setCardImage] = useState(null);
  const cardRef = useRef(null);

  const generateCardImage = async () => {
    if (!cardRef.current) return null;
    
    setIsGeneratingCard(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setCardImage(imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Erro ao gerar card:', error);
      toast.error("Erro ao gerar card visual");
      return null;
    } finally {
      setIsGeneratingCard(false);
    }
  };

  useEffect(() => {
    if (open && !cardImage) {
      setTimeout(() => generateCardImage(), 500);
    }
  }, [open]);

  const shareText = `💕 Descobrimos nossa compatibilidade no Amor & Temperamentos!\n\n${userName}: ${userTemperament} • ${partnerTemperament === userTemperament ? 'Mesma energia' : 'Energias complementares'}\n${partnerName}: ${partnerTemperament}\n\nCompatibilidade: ${compatibility?.score || 75}%\n\n✨ ${isPremium ? 'Análise completa disponível no app!' : 'Descubra mais insights no app!'}\n\n👉 Acesse: temperamentos.app`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=temperamentos.app&text=${encodeURIComponent(shareText)}`,
    messenger: `https://www.messenger.com/t/?link=temperamentos.app&text=${encodeURIComponent(shareText)}`,
    instagram: '', // Instagram não permite links diretos, então vamos copiar o texto
    email: `mailto:?subject=Nossa Compatibilidade - Amor %26 Temperamentos&body=${encodeURIComponent(shareText)}`
  };

  const handleShare = (platform) => {
    if (platform === 'instagram') {
      navigator.clipboard.writeText(shareText);
      toast.success("Texto copiado! Cole no Instagram Direct");
      return;
    }
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareText);
      toast.success("Link de compartilhamento copiado!");
      return;
    }

    window.open(shareLinks[platform], '_blank');
    
    // Analytics tracking (opcional)
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'compatibility_result'
      });
    }
  };

  const downloadCard = async () => {
    if (!cardImage) {
      const image = await generateCardImage();
      if (!image) return;
    }

    const link = document.createElement('a');
    link.download = `compatibilidade-${userName.toLowerCase()}-${partnerName.toLowerCase()}.png`;
    link.href = cardImage;
    link.click();
    
    toast.success("Card baixado com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircleHeart className="h-6 w-6 text-pink-500" />
            Compartilhar com seu Parceiro
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview do Card */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Preview do Card</h3>
            
            <div className="relative">
              {isGeneratingCard && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Gerando card...</p>
                  </div>
                </div>
              )}
              
              <div ref={cardRef}>
                <ShareableCard
                  userTemperament={userTemperament}
                  partnerTemperament={partnerTemperament}
                  compatibility={compatibility}
                  isPremium={isPremium}
                  userName={userName}
                  partnerName={partnerName}
                />
              </div>
            </div>

            <Button 
              onClick={downloadCard} 
              variant="outline" 
              className="w-full"
              disabled={isGeneratingCard}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Card
            </Button>
          </div>

          {/* Opções de Compartilhamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Compartilhar via</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleShare('whatsapp')}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>

              <Button 
                onClick={() => handleShare('telegram')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Telegram
              </Button>

              <Button 
                onClick={() => handleShare('messenger')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Messenger
              </Button>

              <Button 
                onClick={() => handleShare('instagram')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>

              <Button 
                onClick={() => handleShare('email')}
                variant="outline"
                className="border-gray-300"
              >
                <Mail className="h-4 w-4 mr-2" />
                E-mail
              </Button>

              <Button 
                onClick={() => handleShare('copy')}
                variant="outline"
                className="border-gray-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
            </div>

            {/* Informações Premium */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      {isPremium ? "Versão Premium" : "Upgrade para Premium"}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {isPremium 
                        ? "Seu parceiro verá a análise completa com pontos fortes, desafios e sugestões práticas."
                        : "Usuários Premium compartilham cards mais detalhados com insights exclusivos."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instruções */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Seu parceiro receberá o card + link para o app</p>
              <p>• Se já tiver conta, verá o resultado diretamente</p>
              <p>• Se não tiver, será direcionado para criar conta</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareWithPartnerModal;
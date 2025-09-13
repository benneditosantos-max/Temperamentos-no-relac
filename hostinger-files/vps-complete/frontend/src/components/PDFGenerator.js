// 📄 GERADOR DE PDF OTIMIZADO PARA TEMPERAMENTOS

import React from 'react';
import { Download, FileText, Share2, Printer } from 'lucide-react';
import { OptimizedButton } from './TranslationFixes';

// Componente principal para geração de PDFs
export const PDFGenerator = ({ userData, temperamentData, compatibilityData, type = "profile" }) => {
  
  const generatePDF = async () => {
    try {
      // Criar conteúdo HTML para o PDF
      const htmlContent = generateHTMLContent();
      
      // Abrir janela de impressão otimizada
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar carregamento e imprimir
      printWindow.onload = () => {
        printWindow.print();
      };
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const generateHTMLContent = () => {
    const { name, birth_date } = userData || {};
    const { classic_temperament, astrological_modality, zodiac_sign } = temperamentData || {};

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Perfil de Temperamento - ${name}</title>
        <style>
            ${getPDFStyles()}
        </style>
    </head>
    <body>
        <div class="pdf-container">
            ${generateHeader()}
            ${generateProfileSection()}
            ${generateTemperamentSection()}
            ${type === "compatibility" ? generateCompatibilitySection() : ""}
            ${generateFooter()}
        </div>
    </body>
    </html>
    `;
  };

  const getPDFStyles = () => `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #fff1f2, #fef7ed);
    }
    
    .pdf-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    
    .header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: linear-gradient(135deg, #f43f5e, #fb7185);
        color: white;
        border-radius: 15px;
    }
    
    .header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
        font-weight: 700;
    }
    
    .header .subtitle {
        font-size: 1.2em;
        opacity: 0.9;
    }
    
    .section {
        margin-bottom: 30px;
        padding: 25px;
        border-radius: 10px;
        background: #f8fafc;
        border-left: 5px solid #f43f5e;
    }
    
    .section h2 {
        color: #f43f5e;
        font-size: 1.8em;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .section h3 {
        color: #475569;
        font-size: 1.3em;
        margin: 20px 0 10px 0;
    }
    
    .temperament-badge {
        display: inline-block;
        background: linear-gradient(135deg, #f59e0b, #fbbf24);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: bold;
        font-size: 1.1em;
        margin: 10px 0;
    }
    
    .trait-item {
        background: white;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
        border-left: 4px solid #10b981;
    }
    
    .trait-title {
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 5px;
    }
    
    .compatibility-score {
        text-align: center;
        font-size: 2em;
        font-weight: bold;
        color: #f43f5e;
        margin: 20px 0;
    }
    
    .footer {
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        background: #f1f5f9;
        border-radius: 10px;
        color: #64748b;
    }
    
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
    }
    
    @media print {
        body { background: white; }
        .pdf-container { box-shadow: none; padding: 20px; }
        .no-print { display: none; }
    }
  `;

  const generateHeader = () => {
    const { name } = userData || {};
    const { classic_temperament, astrological_modality } = temperamentData || {};

    return `
    <div class="header">
        <h1>Perfil de Temperamento</h1>
        <div class="subtitle">
            ${name} - ${classic_temperament} ${astrological_modality}
        </div>
        <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
            Gerado em ${new Date().toLocaleDateString('pt-BR')} • Temperamentos no Relacionamento
        </div>
    </div>
    `;
  };

  const generateProfileSection = () => {
    const { name, email, birth_date } = userData || {};
    const { zodiac_sign } = temperamentData || {};

    return `
    <div class="section">
        <h2>👤 Informações Pessoais</h2>
        <div class="grid">
            <div>
                <h3>Nome</h3>
                <p>${name || 'Não informado'}</p>
            </div>
            <div>
                <h3>Email</h3>
                <p>${email || 'Não informado'}</p>
            </div>
        </div>
        <div class="grid">
            <div>
                <h3>Data de Nascimento</h3>
                <p>${birth_date ? new Date(birth_date).toLocaleDateString('pt-BR') : 'Não informado'}</p>
            </div>
            <div>
                <h3>Signo Zodiacal</h3>
                <p>${getZodiacName(zodiac_sign) || 'Não calculado'}</p>
            </div>
        </div>
    </div>
    `;
  };

  const generateTemperamentSection = () => {
    const { classic_temperament, astrological_modality } = temperamentData || {};

    const temperamentTraits = getTemperamentTraits(classic_temperament);

    return `
    <div class="section">
        <h2>🧠 Análise de Temperamento</h2>
        
        <div style="text-align: center; margin: 20px 0;">
            <div class="temperament-badge">
                ${classic_temperament} ${astrological_modality}
            </div>
        </div>

        <h3>Características Principais</h3>
        ${temperamentTraits.map(trait => `
            <div class="trait-item">
                <div class="trait-title">${trait.title}</div>
                <div>${trait.description}</div>
            </div>
        `).join('')}

        <h3>Pontos Fortes</h3>
        ${getStrengths(classic_temperament).map(strength => `
            <div class="trait-item">
                <div class="trait-title">✨ ${strength.title}</div>
                <div>${strength.description}</div>
            </div>
        `).join('')}

        <h3>Áreas de Crescimento</h3>
        ${getGrowthAreas(classic_temperament).map(area => `
            <div class="trait-item">
                <div class="trait-title">🎯 ${area.title}</div>
                <div>${area.description}</div>
            </div>
        `).join('')}
    </div>
    `;
  };

  const generateCompatibilitySection = () => {
    if (!compatibilityData) return '';

    return `
    <div class="section">
        <h2>💕 Análise de Compatibilidade</h2>
        
        <div class="compatibility-score">
            ${compatibilityData.score}% de Compatibilidade
        </div>

        <h3>Análise Geral</h3>
        <p style="margin: 15px 0; line-height: 1.8;">${compatibilityData.analysis}</p>

        <div class="grid">
            <div>
                <h3>Pontos de Conexão</h3>
                ${compatibilityData.strengths?.map(strength => `
                    <div class="trait-item">
                        <div class="trait-title">💚 ${strength}</div>
                    </div>
                `).join('') || '<p>Não disponível</p>'}
            </div>
            <div>
                <h3>Desafios a Superar</h3>
                ${compatibilityData.challenges?.map(challenge => `
                    <div class="trait-item">
                        <div class="trait-title">⚠️ ${challenge}</div>
                    </div>
                `).join('') || '<p>Não disponível</p>'}
            </div>
        </div>

        <h3>Dicas para o Relacionamento</h3>
        ${compatibilityData.tips?.map(tip => `
            <div class="trait-item">
                <div class="trait-title">💡 ${tip.title}</div>
                <div>${tip.description}</div>
            </div>
        `).join('') || '<p>Não disponível</p>'}
    </div>
    `;
  };

  const generateFooter = () => `
    <div class="footer">
        <p><strong>Temperamentos no Relacionamento</strong></p>
        <p>Este relatório foi gerado com base em análises de temperamento e compatibilidade astrológica.</p>
        <p>Para mais informações e funcionalidades premium, visite nosso aplicativo.</p>
        <p style="margin-top: 10px; font-size: 0.9em;">
            © ${new Date().getFullYear()} - Todos os direitos reservados
        </p>
    </div>
  `;

  return (
    <div className="flex gap-3">
      <OptimizedButton
        variant="outline"
        onClick={generatePDF}
        icon={<Download className="h-4 w-4" />}
        className="border-rose-200 text-rose-700 hover:bg-rose-50"
      >
        Baixar PDF
      </OptimizedButton>
      
      <OptimizedButton
        variant="ghost"
        onClick={() => window.print()}
        icon={<Printer className="h-4 w-4" />}
        className="text-gray-600 hover:bg-gray-50"
      >
        Imprimir
      </OptimizedButton>
    </div>
  );
};

// Funções auxiliares para dados do temperamento
const getTemperamentTraits = (temperament) => {
  const traits = {
    'Colérico': [
      { title: 'Estilo de Liderança', description: 'Natural líder, toma decisões rapidamente e motiva outros a agir.' },
      { title: 'Comunicação Direta', description: 'Prefere conversas objetivas e vai direto ao ponto.' },
      { title: 'Orientado para Resultados', description: 'Foca em atingir objetivos e resolver problemas eficientemente.' }
    ],
    'Melancólico': [
      { title: 'Profundidade Emocional', description: 'Valoriza conexões profundas e momentos de intimidade real.' },
      { title: 'Pensamento Analítico', description: 'Reflete antes de agir e considera todos os aspectos.' },
      { title: 'Busca por Perfeição', description: 'Tem altos padrões e atenção aos detalhes.' }
    ],
    'Sanguíneo': [
      { title: 'Sociabilidade Natural', description: 'Extrovertido, comunicativo e adaptável a diferentes situações.' },
      { title: 'Otimismo Contagiante', description: 'Mantém uma visão positiva e inspira outros.' },
      { title: 'Flexibilidade', description: 'Se adapta facilmente a mudanças e novas circunstâncias.' }
    ],
    'Fleumático': [
      { title: 'Estabilidade Emocional', description: 'Mantém a calma e oferece suporte consistente.' },
      { title: 'Diplomacia Natural', description: 'Medeia conflitos e busca harmonia nos relacionamentos.' },
      { title: 'Lealdade Profunda', description: 'Comprometido e confiável em relacionamentos longos.' }
    ]
  };
  
  return traits[temperament] || [];
};

const getStrengths = (temperament) => {
  const strengths = {
    'Colérico': [
      { title: 'Iniciativa', description: 'Não espera acontecer, faz acontecer no relacionamento.' },
      { title: 'Proteção', description: 'Defende ativamente o parceiro e a família.' },
      { title: 'Determinação', description: 'Não desiste facilmente dos objetivos do casal.' }
    ],
    'Melancólico': [
      { title: 'Fidelidade', description: 'Extremamente leal e comprometido com o relacionamento.' },
      { title: 'Sensibilidade', description: 'Percebe sutilezas emocionais do parceiro.' },
      { title: 'Planejamento', description: 'Pensa no futuro e constrói bases sólidas.' }
    ],
    'Sanguíneo': [
      { title: 'Alegria', description: 'Traz leveza e diversão para o relacionamento.' },
      { title: 'Adaptabilidade', description: 'Se ajusta facilmente às necessidades do parceiro.' },
      { title: 'Comunicação', description: 'Expressa sentimentos de forma natural e aberta.' }
    ],
    'Fleumático': [
      { title: 'Paz', description: 'Cria um ambiente harmonioso e acolhedor.' },
      { title: 'Paciência', description: 'Compreensivo com as limitações do parceiro.' },
      { title: 'Consistência', description: 'Oferece amor estável e previsível.' }
    ]
  };
  
  return strengths[temperament] || [];
};

const getGrowthAreas = (temperament) => {
  const growthAreas = {
    'Colérico': [
      { title: 'Desenvolver Paciência', description: 'Praticar escuta ativa antes de agir ou decidir.' },
      { title: 'Valorizar Processos', description: 'Nem tudo precisa ser resolvido imediatamente.' },
      { title: 'Demonstrar Vulnerabilidade', description: 'Compartilhar inseguranças e medos com o parceiro.' }
    ],
    'Melancólico': [
      { title: 'Expressar Gratidão', description: 'Focar nas qualidades positivas do relacionamento.' },
      { title: 'Flexibilidade', description: 'Aceitar que nem tudo sai conforme o planejado.' },
      { title: 'Otimismo', description: 'Equilibrar realismo com esperança.' }
    ],
    'Sanguíneo': [
      { title: 'Desenvolver Consistência', description: 'Manter compromissos e promessas feitas.' },
      { title: 'Profundidade', description: 'Investir em conversas mais íntimas e significativas.' },
      { title: 'Planejamento', description: 'Pensar nas consequências antes de agir.' }
    ],
    'Fleumático': [
      { title: 'Assertividade', description: 'Expressar necessidades e limites claramente.' },
      { title: 'Iniciativa', description: 'Tomar a frente em algumas situações do relacionamento.' },
      { title: 'Expressão Emocional', description: 'Compartilhar sentimentos de forma mais aberta.' }
    ]
  };
  
  return growthAreas[temperament] || [];
};

const getZodiacName = (zodiacSign) => {
  const names = {
    'aries': 'Áries', 'taurus': 'Touro', 'gemini': 'Gêmeos',
    'cancer': 'Câncer', 'leo': 'Leão', 'virgo': 'Virgem',
    'libra': 'Libra', 'scorpio': 'Escorpião', 'sagittarius': 'Sagitário',
    'capricorn': 'Capricórnio', 'aquarius': 'Aquário', 'pisces': 'Peixes'
  };
  return names[zodiacSign] || zodiacSign;
};

export default PDFGenerator;
// 🌍 CORREÇÕES DE TRADUÇÃO E MELHORIAS DE UX

import React from 'react';

// Mapeamento de termos em inglês para português
export const translations = {
  // Estados e ações
  'Loading': 'Carregando',
  'Submit': 'Enviar',
  'Save': 'Salvar',
  'Cancel': 'Cancelar',
  'Close': 'Fechar',
  'Complete': 'Concluir',
  'Start': 'Começar',
  'Begin': 'Iniciar',
  'Continue': 'Continuar',
  'Finish': 'Finalizar',
  'Back': 'Voltar',
  'Next': 'Próximo',
  'Previous': 'Anterior',
  'Edit': 'Editar',
  'Delete': 'Excluir',
  'Add': 'Adicionar',
  'Remove': 'Remover',
  'Update': 'Atualizar',
  'Create': 'Criar',
  
  // Interface
  'Login': 'Entrar',
  'Logout': 'Sair',
  'Dashboard': 'Painel',
  'Profile': 'Perfil',
  'Settings': 'Configurações',
  'Report': 'Relatório',
  'Download': 'Baixar',
  'Upload': 'Enviar',
  'Share': 'Compartilhar',
  'Export': 'Exportar',
  'Search': 'Buscar',
  'Filter': 'Filtrar',
  'Help': 'Ajuda',
  'About': 'Sobre',
  'Contact': 'Contato',
  'Home': 'Início',
  
  // Estados de feedback
  'Error': 'Erro',
  'Success': 'Sucesso',
  'Warning': 'Aviso',
  'Info': 'Informação',
  
  // Específicos do app
  'Temperament': 'Temperamento',
  'Compatibility': 'Compatibilidade',
  'Relationship': 'Relacionamento',
  'Partner': 'Parceiro(a)',
  'Premium': 'Premium',
  'Free': 'Gratuito',
  'Upgrade': 'Evoluir',
  
  // Botões emocionais otimizados
  'Get Started': 'Quero descobrir agora',
  'Discover Now': 'Descobrir agora',
  'Share with Love': 'Compartilhar com meu amor',
  'Grow Together': 'Evoluir juntos',
  'Unlock Premium': 'Desbloquear Premium',
  'Send Invitation': 'Enviar convite',
  'Generate Report': 'Gerar relatório',
  'Save Progress': 'Salvar progresso',
  'Complete Assessment': 'Finalizar avaliação'
};

// Função para traduzir textos
export const t = (key, fallback = key) => {
  return translations[key] || fallback;
};

// Textos otimizados para engajamento
export const emotionalCopy = {
  headlines: {
    main: "Descubra a Química do seu Relacionamento",
    secondary: "Entenda como seus temperamentos se conectam",
    cta: "Construam juntos um amor mais profundo e consciente"
  },
  
  buttons: {
    primary: "Quero descobrir agora",
    secondary: "Compartilhar com meu amor",
    premium: "Evoluir juntos",
    diagnosis: "Descobrir meu temperamento",
    sharing: "Enviar convite com amor",
    download: "Baixar meu perfil",
    upgrade: "Desbloquear todo potencial"
  },
  
  descriptions: {
    diagnosis: "Responda algumas perguntas e descubra como você se relaciona",
    compatibility: "Entenda como vocês se conectam e onde podem crescer juntos",
    premium: "Desbloqueie exercícios exclusivos, relatórios detalhados e orientação personalizada",
    sharing: "Convide seu amor para uma jornada de descobertas juntos"
  },
  
  encouragement: {
    diagnosis: "Cada pergunta nos ajuda a entender melhor sua essência",
    results: "Parabéns! Você deu o primeiro passo para um relacionamento mais consciente",
    sharing: "O amor cresce quando é compartilhado. Convide seu parceiro!",
    premium: "Invista no que realmente importa: seu relacionamento"
  }
};

// Componente para textos com animação
export const AnimatedText = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-700 transform ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Componente para botões otimizados
export const OptimizedButton = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  children, 
  loading = false,
  disabled = false,
  onClick,
  className = "",
  ...props 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl",
    outline: "border-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-400",
    ghost: "text-rose-600 hover:bg-rose-50"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-full font-semibold
        transition-all duration-300 transform
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:transform-none
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Processando...
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

// Componente para cards melhorados
export const OptimizedCard = ({ 
  title, 
  description, 
  icon, 
  color = "rose", 
  children, 
  hover = true,
  className = "",
  ...props 
}) => {
  const colors = {
    rose: "from-rose-50 to-pink-50 border-rose-200",
    amber: "from-amber-50 to-yellow-50 border-amber-200",
    emerald: "from-emerald-50 to-teal-50 border-emerald-200",
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    purple: "from-purple-50 to-pink-50 border-purple-200"
  };

  return (
    <div
      className={`
        bg-gradient-to-br ${colors[color]}
        border-2 rounded-xl p-6
        ${hover ? 'hover:shadow-xl hover:scale-105 transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className={`p-2 rounded-full bg-${color}-100`}>
              {icon}
            </div>
          )}
          {title && (
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          )}
        </div>
      )}
      
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      
      {children}
    </div>
  );
};

// Componente para feedback visual
export const FeedbackMessage = ({ type = "info", message, icon, visible = true }) => {
  if (!visible) return null;

  const types = {
    success: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-800",
    error: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800",
    warning: "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800",
    info: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800"
  };

  return (
    <div className={`
      ${types[type]}
      border-2 rounded-lg p-4 mb-4
      animate-fade-in-up
      flex items-start gap-3
    `}>
      {icon && <span className="flex-shrink-0 text-lg">{icon}</span>}
      <p className="leading-relaxed">{message}</p>
    </div>
  );
};

// Componente para progresso com animação
export const AnimatedProgress = ({ value, max = 100, label, color = "rose" }) => {
  const [animatedValue, setAnimatedValue] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = (animatedValue / max) * 100;

  const colors = {
    rose: "from-rose-400 to-pink-400",
    amber: "from-amber-400 to-yellow-400",
    emerald: "from-emerald-400 to-teal-400",
    blue: "from-blue-400 to-indigo-400"
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{animatedValue}/{max}</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Hooks úteis
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

export const useAnimation = (trigger) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return isAnimating;
};

// Função para copy melhorado
export const generateShareMessage = (userName, temperament, partnerName = "") => {
  const partnerText = partnerName ? ` Quero que você, ${partnerName},` : " Quero que você";
  
  return `Oi amor! 💕 

Acabei de descobrir algo incrível sobre mim através do teste de temperamentos. Sou ${temperament} e isso explica muito sobre como me relaciono!

${partnerText} descubra seu temperamento também para entendermos melhor nossa conexão. ✨

Vamos fazer juntos essa jornada de autoconhecimento? ❤️

Clique aqui para descobrir: [LINK]

Com amor,
${userName} 💖`;
};

export default {
  translations,
  t,
  emotionalCopy,
  AnimatedText,
  OptimizedButton,
  OptimizedCard,
  FeedbackMessage,
  AnimatedProgress,
  useLocalStorage,
  useAnimation,
  generateShareMessage
};
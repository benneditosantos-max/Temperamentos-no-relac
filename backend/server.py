from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'temperamentos_db')
db = client[db_name]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ZodiacSign(str, Enum):
    ARIES = "aries"
    TAURUS = "taurus"
    GEMINI = "gemini"
    CANCER = "cancer"
    LEO = "leo"
    VIRGO = "virgo"
    LIBRA = "libra"
    SCORPIO = "scorpio"
    SAGITTARIUS = "sagittarius"
    CAPRICORN = "capricorn"
    AQUARIUS = "aquarius"
    PISCES = "pisces"

class Modality(str, Enum):
    CARDINAL = "cardinal"
    FIXED = "fixed"
    MUTABLE = "mutable"

class BadgeType(str, Enum):
    PROFILE_CREATED = "profile_created"
    QUESTIONNAIRE_COMPLETED = "questionnaire_completed"
    REPORT_GENERATED = "report_generated"
    SHARED_WITH_PARTNER = "shared_with_partner"
    FIRST_CONNECTION_CREATED = "first_connection_created"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    zodiac_sign: ZodiacSign
    birth_date: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_premium: bool = False
    progress_percentage: int = 0
    badges: List[str] = []

class UserCreate(BaseModel):
    name: str
    email: str
    zodiac_sign: ZodiacSign
    birth_date: str

class QuestionnaireAnswer(BaseModel):
    question_id: int
    answer: str
    score: int

class QuestionnaireResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    answers: List[QuestionnaireAnswer]
    dominant_modality: Modality
    secondary_modality: Optional[Modality]
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuestionnaireSubmission(BaseModel):
    user_id: str
    answers: List[QuestionnaireAnswer]

class CompatibilityReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    compatibility_score: int
    strengths: List[str]
    challenges: List[str]
    recommendations: List[str]
    premium_insights: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompatibilityRequest(BaseModel):
    user1_id: str
    user2_id: str

# Enhanced Partner and Compatibility Models
class PartnerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Who added this partner
    name: str
    birth_date: str
    questionnaire_answers: List[QuestionnaireAnswer]
    zodiac_sign: ZodiacSign
    temperament: str  # Colérico, Sanguíneo, Melancólico, Fleumático
    element: str  # Fogo, Ar, Água, Terra
    quality: str  # Cardinal, Fixo, Mutável
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PartnerCreate(BaseModel):
    name: str
    birth_date: str
    answers: List[QuestionnaireAnswer]

class EnhancedCompatibilityReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    partner_id: str
    user_profile: Dict[str, str]
    partner_profile: Dict[str, str]
    general_affinity: str  # Alto, Médio, Baixo
    compatibility_score: int
    potential_conflicts: List[str]
    strength_points: List[str]
    weakness_points: List[str]
    detailed_analysis: Dict[str, str]
    recommendations: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Payment Models
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    currency: str = "BRL"
    session_id: str
    payment_status: str = "pending"
    stripe_status: str = "pending"
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PremiumUpgradeRequest(BaseModel):
    user_id: str
    origin_url: str

# Enhanced Premium Content Models
class TemperamentProfile(BaseModel):
    modality: Modality
    title: str
    description: str
    communication_style: str
    conflict_resolution: str
    intimacy_approach: str
    decision_making: str
    strengths: List[str]
    challenges: List[str]
    growth_tips: List[str]
    emotional_triggers: List[str]
    growth_strategies: List[str]
    daily_practices: List[str]
    relationship_dynamics: Dict[str, str]

class CoupleExercise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str  # communication, intimacy, conflict_resolution
    description: str
    instructions: List[str]
    duration_minutes: int
    difficulty_level: int  # 1-5
    required_materials: List[str]
    expected_outcomes: List[str]
    follow_up_questions: List[str]

class ExerciseProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    exercise_title: str
    difficulty_level: int
    completed: bool = False
    feedback: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JourneyLevel(BaseModel):
    level: int
    title: str
    description: str
    unlock_requirements: Dict[str, Any]
    content_unlocked: List[str]
    exercises_available: List[str]
    estimated_duration_days: int

class AdvancedSelfKnowledgeQuestion(BaseModel):
    id: int
    question: str
    category: str
    reflection_prompt: str
    follow_up_questions: List[str]
    interpretation_guide: str

class PersonalizedReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    report_type: str  # weekly_progress, monthly_deep_dive, relationship_health
    insights: List[str]
    growth_areas: List[str]
    achievements: List[str]
    next_steps: List[str]
    custom_advice: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DailyAdvice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    modality: Modality
    advice_text: str
    reflection_question: str
    action_item: str
    category: str  # self_awareness, communication, growth
    date: str
    is_premium: bool = True

class SelfKnowledgeQuestion(BaseModel):
    id: int
    question: str
    options: List[Dict[str, Any]]
    category: str  # communication, conflict, intimacy, decision_making

class SelfKnowledgeAnswer(BaseModel):
    question_id: int
    answer: str
    category: str
    score: int

class SelfKnowledgeResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    answers: List[SelfKnowledgeAnswer]
    insights: Dict[str, str]  # category -> insight
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WeeklyMission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    points: int
    week_number: int
    year: int
    mission_type: str  # self_knowledge, communication, exercise
    is_active: bool = True

class UserMission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mission_id: str
    completed: bool = False
    completed_at: Optional[datetime] = None
    points_earned: int = 0

class UserProgress(BaseModel):
    user_id: str
    total_points: int = 0
    current_level: int = 1
    missions_completed: int = 0
    weekly_streak: int = 0
    achievements: List[str] = []
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Classical Temperaments Mapping
CLASSICAL_TEMPERAMENTS = {
    "fire": "Colérico",      # Impulsivo, líder, energético
    "air": "Sanguíneo",      # Social, otimista, comunicativo  
    "earth": "Melancólico",  # Analítico, perfeccionista, prático
    "water": "Fleumático"    # Calmo, diplomático, empático
}

TEMPERAMENT_DESCRIPTIONS = {
    "Colérico": {
        "description": "Líder natural, decidido e ambicioso. Gosta de controle e ação.",
        "traits": ["Determinado", "Independente", "Competitivo", "Direto", "Orientado a objetivos"],
        "challenges": ["Impaciência", "Dominante", "Teimoso", "Crítico", "Workaholic"]
    },
    "Sanguíneo": {
        "description": "Sociável, otimista e carismático. Ama pessoas e novas experiências.",
        "traits": ["Entusiasmado", "Persuasivo", "Espontâneo", "Otimista", "Criativo"],
        "challenges": ["Desorganizado", "Impulsivo", "Falador", "Emocional", "Procrastinador"]
    },
    "Melancólico": {
        "description": "Pensativo, detalhista e perfeccionista. Valoriza qualidade e precisão.",
        "traits": ["Analítico", "Leal", "Organizado", "Sensível", "Perfeccionista"],
        "challenges": ["Pessimista", "Crítico", "Moody", "Rígido", "Indeciso"]
    },
    "Fleumático": {
        "description": "Calmo, diplomático e estável. Busca harmonia e evita conflitos.",
        "traits": ["Paciente", "Confiável", "Diplomático", "Eficiente", "Observador"],
        "challenges": ["Indeciso", "Passivo", "Teimoso", "Procrastinador", "Evita confrontos"]
    }
}

# Enhanced Zodiac Sign Data with Complete Mapping
ZODIAC_DATA = {
    ZodiacSign.ARIES: {
        "modality": Modality.CARDINAL, "element": "fire", "name": "Áries",
        "temperament": "Colérico", "quality": "Cardinal", "element_pt": "Fogo",
        "dates": "21/03 - 19/04"
    },
    ZodiacSign.TAURUS: {
        "modality": Modality.FIXED, "element": "earth", "name": "Touro",
        "temperament": "Melancólico", "quality": "Fixo", "element_pt": "Terra",
        "dates": "20/04 - 20/05"
    },
    ZodiacSign.GEMINI: {
        "modality": Modality.MUTABLE, "element": "air", "name": "Gêmeos",
        "temperament": "Sanguíneo", "quality": "Mutável", "element_pt": "Ar",
        "dates": "21/05 - 20/06"
    },
    ZodiacSign.CANCER: {
        "modality": Modality.CARDINAL, "element": "water", "name": "Câncer",
        "temperament": "Fleumático", "quality": "Cardinal", "element_pt": "Água",
        "dates": "21/06 - 22/07"
    },
    ZodiacSign.LEO: {
        "modality": Modality.FIXED, "element": "fire", "name": "Leão",
        "temperament": "Colérico", "quality": "Fixo", "element_pt": "Fogo",
        "dates": "23/07 - 22/08"
    },
    ZodiacSign.VIRGO: {
        "modality": Modality.MUTABLE, "element": "earth", "name": "Virgem",
        "temperament": "Melancólico", "quality": "Mutável", "element_pt": "Terra",
        "dates": "23/08 - 22/09"
    },
    ZodiacSign.LIBRA: {
        "modality": Modality.CARDINAL, "element": "air", "name": "Libra",
        "temperament": "Sanguíneo", "quality": "Cardinal", "element_pt": "Ar",
        "dates": "23/09 - 22/10"
    },
    ZodiacSign.SCORPIO: {
        "modality": Modality.FIXED, "element": "water", "name": "Escorpião",
        "temperament": "Fleumático", "quality": "Fixo", "element_pt": "Água",
        "dates": "23/10 - 21/11"
    },
    ZodiacSign.SAGITTARIUS: {
        "modality": Modality.MUTABLE, "element": "fire", "name": "Sagitário",
        "temperament": "Colérico", "quality": "Mutável", "element_pt": "Fogo",
        "dates": "22/11 - 21/12"
    },
    ZodiacSign.CAPRICORN: {
        "modality": Modality.CARDINAL, "element": "earth", "name": "Capricórnio",
        "temperament": "Melancólico", "quality": "Cardinal", "element_pt": "Terra",
        "dates": "22/12 - 19/01"
    },
    ZodiacSign.AQUARIUS: {
        "modality": Modality.FIXED, "element": "air", "name": "Aquário",
        "temperament": "Sanguíneo", "quality": "Fixo", "element_pt": "Ar",
        "dates": "20/01 - 18/02"
    },
    ZodiacSign.PISCES: {
        "modality": Modality.MUTABLE, "element": "water", "name": "Peixes",
        "temperament": "Fleumático", "quality": "Mutável", "element_pt": "Água",
        "dates": "19/02 - 20/03"
    }
}

# Enhanced Detailed Temperament Profiles
TEMPERAMENT_PROFILES = {
    Modality.CARDINAL: TemperamentProfile(
        modality=Modality.CARDINAL,
        title="Temperamento Cardinal - O Iniciador",
        description="Pessoas com temperamento Cardinal são líderes naturais, iniciadores e pioneiros. Elas têm uma energia direcionada para começar projetos, tomar decisões rápidas e liderar mudanças. São movidas pela ação e pelo desejo de criar algo novo.",
        communication_style="Diretos e assertivos na comunicação. Preferem conversas objetivas e focadas em soluções. Podem parecer impacientes com discussões longas sem direcionamento claro.",
        conflict_resolution="Enfrentam conflitos de frente, preferindo resolver rapidamente. Tendem a tomar a liderança na busca por soluções práticas e imediatas.",
        intimacy_approach="Na intimidade, são apaixonados e intensos. Gostam de tomar a iniciativa e criar momentos especiais. Valorizam parceiros que acompanhem sua energia.",
        decision_making="Tomam decisões rapidamente, baseadas na intuição e na urgência do momento. Preferem agir a ficar analisando por muito tempo.",
        strengths=["Liderança natural", "Iniciativa", "Coragem para mudanças", "Energia motivadora", "Visão de futuro"],
        challenges=["Impaciência", "Dificuldade em delegar", "Pode ser dominante", "Ansiedade por resultados", "Falta de persistência em projetos longos"],
        growth_tips=["Pratique a paciência e a escuta ativa", "Aprenda a delegar responsabilidades", "Desenvolva persistência em projetos de longo prazo", "Equilibre ação com reflexão"],
        emotional_triggers=[
            "Lentidão ou indecisão dos outros",
            "Falta de progresso visível",
            "Microgerenciamento ou controle excessivo",
            "Rotinas muito rígidas sem espaço para inovação",
            "Críticas à sua capacidade de liderança"
        ],
        growth_strategies=[
            "Desenvolva técnicas de respiração profunda para moments de impaciência",
            "Pratique meditação de 10 minutos diários para cultivar paciência",
            "Crie um sistema de delegação progressiva - comece com tarefas pequenas",
            "Estabeleça metas intermediárias para projetos longos",
            "Pratique ouvir sem interromper por 5 minutos em cada conversa"
        ],
        daily_practices=[
            "Manhã: Defina 3 prioridades principais do dia",
            "Tarde: Pare 10 minutos para reflexão sobre o progresso",
            "Noite: Identifique uma lição aprendida e uma gratidão",
            "Semanal: Reserve 1h para planejamento estratégico pessoal"
        ],
        relationship_dynamics={
            "with_cardinal": "Parceria dinâmica mas pode gerar competição. Definam áreas de liderança específicas.",
            "with_fixed": "Complementaridade poderosa. O Fixo oferece estabilidade, o Cardinal traz movimento.",
            "with_mutable": "Combinação criativa. O Cardinal inicia, o Mutável adapta e aperfeiçoa."
        }
    ),
    Modality.FIXED: TemperamentProfile(
        modality=Modality.FIXED,
        title="Temperamento Fixo - O Estabilizador",
        description="Pessoas com temperamento Fixo são conhecidas pela estabilidade, lealdade e determinação. Elas valorizam segurança, consistência e profundidade nas relações. São o alicerce sólido em qualquer relacionamento.",
        communication_style="Comunicação calma e ponderada. Preferem conversas profundas e significativas. Podem levar tempo para expressar sentimentos, mas quando o fazem, é com sinceridade.",
        conflict_resolution="Evitam conflitos desnecessários, mas quando enfrentam problemas, mantêm sua posição com firmeza. Preferem estabilidade a mudanças drásticas.",
        intimacy_approach="Na intimidade, são leais e dedicados. Constroem conexões profundas e duradouras. Valorizam rituais e tradições no relacionamento.",
        decision_making="Tomam decisões cuidadosamente, considerando todas as implicações. Preferem manter o que já está funcionando bem.",
        strengths=["Lealdade inabalável", "Estabilidade emocional", "Determinação", "Confiabilidade", "Profundidade nas relações"],
        challenges=["Resistência a mudanças", "Teimosia", "Dificuldade para se adaptar", "Possessividade", "Rigidez de pensamento"],
        growth_tips=["Pratique a flexibilidade em situações menores", "Abra-se para novas experiências", "Aprenda a expressar sentimentos mais abertamente", "Desenvolva tolerância a mudanças"],
        emotional_triggers=[
            "Mudanças bruscas ou inesperadas",
            "Pressão para tomar decisões rápidas",
            "Questionamento da sua lealdade ou compromisso",
            "Instabilidade financeira ou emocional",
            "Traição ou quebra de confiança"
        ],
        growth_strategies=[
            "Comece com micro-mudanças diárias (novo caminho para o trabalho, comida diferente)",
            "Pratique o exercício '3 opções': sempre considere 3 alternativas antes de decidir",
            "Desenvolva um ritual de 'abertura' - 5 min diários pensando em uma novidade para experimentar",
            "Crie um 'fundo de mudança' - reserve 10% do tempo para experimentos",
            "Pratique yoga ou tai chi para desenvolver flexibilidade física e mental"
        ],
        daily_practices=[
            "Manhã: Faça uma pequena mudança na rotina matinal",
            "Tarde: Identifique uma crença ou opinião e questione-a gentilmente",
            "Noite: Reflita sobre algo novo que aprendeu hoje",
            "Semanal: Experimente uma atividade completamente nova"
        ],
        relationship_dynamics={
            "with_cardinal": "O Cardinal acelera, o Fixo estabiliza. Negocie o ritmo das mudanças.",
            "with_fixed": "Relacionamento sólido mas pode estagnar. Introduzam novidades juntos regularmente.",
            "with_mutable": "O Fixo oferece âncora, o Mutável traz variedade. Equilibrem estabilidade e mudança."
        }
    ),
    Modality.MUTABLE: TemperamentProfile(
        modality=Modality.MUTABLE,
        title="Temperamento Mutável - O Adaptador",
        description="Pessoas com temperamento Mutável são flexíveis, adaptáveis e versáteis. Elas se ajustam facilmente a mudanças e são excelentes mediadoras. São como água, fluindo e se moldando às circunstâncias.",
        communication_style="Comunicação flexível e empática. Adaptam seu estilo conforme a situação e a pessoa. São bons ouvintes e mediadores naturais.",
        conflict_resolution="Preferem evitar conflitos através de compromissos e adaptações. São excelentes em encontrar soluções que agradem a todos.",
        intimacy_approach="Na intimidade, são adaptáveis e atenciosos às necessidades do parceiro. Criam harmonia e evitam tensões desnecessárias.",
        decision_making="Consideram múltiplas perspectivas antes de decidir. Podem mudar de opinião conforme novas informações surgem.",
        strengths=["Adaptabilidade", "Empatia", "Versatilidade", "Capacidade de mediação", "Flexibilidade mental"],
        challenges=["Indecisão", "Falta de direção clara", "Dificuldade em manter posições", "Evitação de conflitos necessários", "Inconsistência"],
        growth_tips=["Desenvolva maior assertividade", "Pratique a tomada de decisões firmes", "Aprenda a manter posições importantes", "Equilibre adaptabilidade com consistência"],
        emotional_triggers=[
            "Pressão para tomar posições rígidas",
            "Ambientes muito estruturados ou inflexíveis",
            "Conflitos diretos e confrontos agressivos",
            "Críticas à sua 'falta de consistência'",
            "Situações que exigem compromisso de longo prazo imediato"
        ],
        growth_strategies=[
            "Desenvolva o 'núcleo firme': identifique 3 valores inegociáveis pessoais",
            "Pratique a técnica 'sim decidido': tome uma decisão pequena por dia e mantenha-a",
            "Crie rituais de consistência: 3 hábitos pequenos que pratica diariamente",
            "Desenvolva assertividade com o exercício 'opinião própria': expresse sua visão antes de ouvir outros",
            "Use o 'método das âncoras': estabeleça pontos fixos na rotina para criar estabilidade"
        ],
        daily_practices=[
            "Manhã: Defina uma prioridade pessoal que não será negociada hoje",
            "Tarde: Pratique expressar uma opinião própria antes de pedir outras perspectivas",
            "Noite: Identifique uma decisão que tomou e manteve durante o dia",
            "Semanal: Escolha um compromisso pequeno e cumpra-o por 7 dias seguidos"
        ],
        relationship_dynamics={
            "with_cardinal": "O Cardinal dirige, o Mutável refina. Estabeleçam momentos para que o Mutável também lidere.",
            "with_fixed": "O Fixo oferece estrutura, o Mutável traz leveza. Respeitem os ritmos diferentes.",
            "with_mutable": "Grande harmonia mas pode faltar direção. Definam metas claras e prazos juntos."
        }
    )
}

# Self-Knowledge Questions
SELF_KNOWLEDGE_QUESTIONS = [
    SelfKnowledgeQuestion(
        id=1,
        question="Como você reage quando sente que não é ouvido em uma discussão?",
        category="communication",
        options=[
            {"answer": "Falo mais alto e insisto no meu ponto de vista", "modality": "cardinal", "score": 3},
            {"answer": "Me calo e espero o momento certo para ser ouvido", "modality": "fixed", "score": 3},
            {"answer": "Tento encontrar uma forma diferente de me expressar", "modality": "mutable", "score": 3}
        ]
    ),
    SelfKnowledgeQuestion(
        id=2,
        question="Quando seu parceiro está passando por um momento difícil, você:",
        category="intimacy",
        options=[
            {"answer": "Tomo a iniciativa para resolver o problema rapidamente", "modality": "cardinal", "score": 3},
            {"answer": "Ofereço apoio constante e estável", "modality": "fixed", "score": 3},
            {"answer": "Me adapto às necessidades dele no momento", "modality": "mutable", "score": 3}
        ]
    ),
    SelfKnowledgeQuestion(
        id=3,
        question="Em situações de conflito no relacionamento, sua tendência é:",
        category="conflict",
        options=[
            {"answer": "Enfrentar diretamente e buscar solução imediata", "modality": "cardinal", "score": 3},
            {"answer": "Manter minha posição e esperar que o tempo resolva", "modality": "fixed", "score": 3},
            {"answer": "Procurar um meio-termo que satisfaça ambos", "modality": "mutable", "score": 3}
        ]
    ),
    SelfKnowledgeQuestion(
        id=4,
        question="Quando precisam tomar uma decisão importante juntos, você:",
        category="decision_making",
        options=[
            {"answer": "Lidero o processo e tomo a decisão rapidamente", "modality": "cardinal", "score": 3},
            {"answer": "Analiso profundamente e mantenho uma posição clara", "modality": "fixed", "score": 3},
            {"answer": "Considero todas as opções e me adapto à melhor escolha", "modality": "mutable", "score": 3}
        ]
    ),
    SelfKnowledgeQuestion(
        id=5,
        question="O que mais te incomoda em um relacionamento?",
        category="communication",
        options=[
            {"answer": "Falta de ação e decisão do parceiro", "modality": "cardinal", "score": 3},
            {"answer": "Instabilidade e mudanças constantes", "modality": "fixed", "score": 3},
            {"answer": "Rigidez e falta de flexibilidade", "modality": "mutable", "score": 3}
        ]
    ),
    SelfKnowledgeQuestion(
        id=6,
        question="Como você demonstra amor no relacionamento?",
        category="intimacy",
        options=[
            {"answer": "Através de gestos grandiosos e iniciativas românticas", "modality": "cardinal", "score": 3},
            {"answer": "Com lealdade, consistência e dedicação diária", "modality": "fixed", "score": 3},
            {"answer": "Adaptando-me às necessidades e desejos do parceiro", "modality": "mutable", "score": 3}
        ]
    )
]

# Premium Couple Exercises
COUPLE_EXERCISES = [
    CoupleExercise(
        title="Ritual de Conexão Diária",
        category="communication",
        description="Um exercício simples para manter a conexão emocional forte todos os dias",
        instructions=[
            "Reservem 15 minutos no final do dia, sem distrações (celular, TV, etc.)",
            "Sentem-se de frente um para o outro, mantendo contato visual",
            "Compartilhem 3 coisas: 1 gratidão, 1 desafio do dia, 1 expectativa para amanhã",
            "Ouçam sem interromper, apenas fazendo perguntas de esclarecimento",
            "Terminem com um abraço de 20 segundos (tempo necessário para liberar ocitocina)"
        ],
        duration_minutes=15,
        difficulty_level=1,
        required_materials=["Ambiente tranquilo", "15 minutos livres"],
        expected_outcomes=["Maior intimidade emocional", "Melhor comunicação", "Conexão diária fortalecida"],
        follow_up_questions=[
            "Como vocês se sentiram durante o exercício?",
            "Que diferenças notaram na qualidade da conexão?",
            "Quais ajustes fariam para a próxima vez?"
        ]
    ),
    CoupleExercise(
        title="Roleplay de Resolução de Conflitos",
        category="conflict_resolution",
        description="Pratiquem resolver conflitos de forma construtiva através de representação",
        instructions=[
            "Escolham um conflito menor recente (não resolvido completamente)",
            "Definam quem será 'Person A' e 'Person B' primeiro",
            "Person A expressa seu ponto de vista por 3 minutos sem interrupção",
            "Person B reflete o que ouviu antes de responder ('Entendi que você sente...')",
            "Troquem de papéis e repitam o processo",
            "Juntos, identifiquem pelo menos 2 pontos de acordo",
            "Criem um plano de ação com pequenos passos concretos"
        ],
        duration_minutes=30,
        difficulty_level=3,
        required_materials=["Timer", "Papel para anotações"],
        expected_outcomes=["Melhores habilidades de escuta", "Resolução construtiva", "Maior empatia mútua"],
        follow_up_questions=[
            "O que descobriram sobre o estilo de comunicação um do outro?",
            "Que estratégias funcionaram melhor?",
            "Como podem aplicar isso em conflitos futuros?"
        ]
    ),
    CoupleExercise(
        title="Mapa da Intimidade",
        category="intimacy",
        description="Explorem e compartilhem suas necessidades e desejos de intimidade física e emocional",
        instructions=[
            "Em papéis separados, desenhem/escrevam sobre 4 tipos de intimidade que valorizam:",
            "1. Intimidade Física (toque, proximidade)",
            "2. Intimidade Emocional (sentimentos, vulnerabilidade)",  
            "3. Intimidade Intelectual (ideias, sonhos)",
            "4. Intimidade Espiritual (valores, propósito)",
            "Compartilhem seus 'mapas' um de cada vez, explicando cada área",
            "Identifiquem áreas de sobreposição e diferenças",
            "Criem um 'plano de intimidade' incluindo elementos importantes para ambos"
        ],
        duration_minutes=45,
        difficulty_level=4,
        required_materials=["Papel", "Canetas coloridas", "Ambiente privado"],
        expected_outcomes=["Melhor compreensão das necessidades", "Intimidade mais profunda", "Plano personalizado"],
        follow_up_questions=[
            "Que descobertas surpreenderam vocês?",
            "Em que áreas gostariam de crescer mais?",
            "Como vão implementar o plano nas próximas semanas?"
        ]
    ),
    CoupleExercise(
        title="Arquitetura da Vida Compartilhada",
        category="intimacy",
        description="Desenhem juntos a arquitetura completa do relacionamento que desejam construir nos próximos 5-10 anos",
        instructions=[
            "Criem um ambiente cerimonial: velas, música suave, sem distrações por 90 minutos",
            "Dividam uma cartolina grande em 6 áreas: Amor & Intimidade, Crescimento Pessoal, Família & Filhos, Carreira & Dinheiro, Aventuras & Sonhos, Legado & Propósito",
            "Em cada área, escrevam/desenhem: Onde estamos hoje? Onde queremos chegar? Quais são nossos medos? Quais são nossas esperanças?",
            "Para cada área, definam 3 valores inegociáveis e 3 sonhos compartilhados",
            "Criem um 'Contrato de Crescimento': prometam apoiar ativamente o crescimento um do outro, mesmo quando for desconfortável",
            "Estabeleçam rituais trimestrais para revisar e ajustar esta 'arquitetura'",
            "Terminem criando uma declaração de missão do relacionamento (1-2 frases poderosas)",
            "Assinem juntos e guardem como documento sagrado do relacionamento"
        ],
        duration_minutes=90,
        difficulty_level=5,
        required_materials=["Cartolina grande", "Canetas coloridas", "Velas", "Ambiente íntimo", "90 minutos ininterruptos"],
        expected_outcomes=["Visão compartilhada profunda", "Alinhamento de valores e sonhos", "Compromisso consciente de crescimento mútuo", "Rituais de conexão estabelecidos"],
        follow_up_questions=[
            "Que diferenças entre suas visões individuais mais os surpreenderam?",
            "Quais compromissos vão exigir mais coragem e crescimento de cada um?",
            "Como pretendem honrar este 'contrato sagrado' nos momentos difíceis?",
            "Que rituais específicos vão implementar para manter viva esta visão?"
        ]
    )
]

# Journey Levels System
JOURNEY_LEVELS = [
    JourneyLevel(
        level=1,
        title="Despertar - Descoberta Pessoal",
        description="Compreenda profundamente seu próprio temperamento e padrões",
        unlock_requirements={"profile_created": True, "questionnaire_completed": True},
        content_unlocked=["Perfil detalhado", "Gatilhos emocionais", "Práticas diárias"],
        exercises_available=["Ritual de Conexão Diária"],
        estimated_duration_days=7
    ),
    JourneyLevel(
        level=2,
        title="Conexão - Dinâmica do Casal",
        description="Explore como vocês interagem e se complementam",
        unlock_requirements={"level_1_completed": True, "compatibility_report": True},
        content_unlocked=["Dinâmicas de relacionamento", "Exercícios de comunicação"],
        exercises_available=["Roleplay de Resolução de Conflitos", "Ritual de Conexão Diária"],
        estimated_duration_days=14
    ),
    JourneyLevel(
        level=3,
        title="Profundidade - Intimidade Avançada",
        description="Desenvolvam intimidade em múltiplas dimensões",
        unlock_requirements={"level_2_completed": True, "exercises_completed": 3},
        content_unlocked=["Mapa da Intimidade", "Conselheiro Virtual Avançado"],
        exercises_available=["Mapa da Intimidade", "Todos os exercícios anteriores"],
        estimated_duration_days=21
    ),
    JourneyLevel(
        level=4,
        title="Maestria - Crescimento Contínuo",
        description="Mantenham e aprofundem continuamente sua conexão",
        unlock_requirements={"level_3_completed": True, "weeks_active": 4},
        content_unlocked=["Conselhos personalizados", "Relatórios mensais", "Exercícios avançados"],
        exercises_available=["Todos + exercícios personalizados"],
        estimated_duration_days=30
    )
]

# Advanced Self-Knowledge Questions
ADVANCED_SELF_KNOWLEDGE = [
    AdvancedSelfKnowledgeQuestion(
        id=1,
        question="Quando você se sente mais autêntico e verdadeiro consigo mesmo?",
        category="identity",
        reflection_prompt="Pense em momentos específicos quando você sentiu que estava sendo completamente você mesmo, sem máscaras ou pretensões.",
        follow_up_questions=[
            "O que estava acontecendo ao seu redor nesses momentos?",
            "Quais pessoas estavam presentes?",
            "Que atividades você estava fazendo?",
            "Como você pode criar mais desses momentos na sua vida?"
        ],
        interpretation_guide="A autenticidade está ligada ao alinhamento entre valores internos e ações externas. Pessoas Cardinais se sentem autênticas liderando, Fixas mantendo valores, Mutáveis adaptando-se genuinamente."
    ),
    AdvancedSelfKnowledgeQuestion(
        id=2,
        question="Qual é o legado emocional que você gostaria de deixar no seu relacionamento?",
        category="purpose",
        reflection_prompt="Imagine seu parceiro descrevendo o impacto emocional que você teve na vida dele. O que você gostaria que fosse dito?",
        follow_up_questions=[
            "Que qualidades emocionais você mais valoriza?",
            "Como você quer ser lembrado pelo seu parceiro?",
            "Que diferença você quer fazer na vida dele?",
            "Que passos você pode dar hoje para construir esse legado?"
        ],
        interpretation_guide="O legado emocional reflete seus valores mais profundos. Cardinais querem inspirar, Fixos querem oferecer segurança, Mutáveis querem proporcionar crescimento."
    )
]

# Daily Advice Templates
DAILY_ADVICE_TEMPLATES = {
    Modality.CARDINAL: [
        {
            "advice": "Hoje, pratique liderar através do exemplo ao invés de palavras. Sua energia natural inspira mais do que direcionamentos verbais.",
            "reflection": "Em que situação hoje você pode influenciar positivamente alguém apenas sendo você mesmo?",
            "action": "Escolha uma área para liderar pelo exemplo durante todo o dia.",
            "category": "leadership"
        },
        {
            "advice": "Sua impaciência pode ser transformada em urgência produtiva. Canal essa energia para uma prioridade importante.",
            "reflection": "Qual projeto ou objetivo está esperando sua energia de iniciação?",
            "action": "Dedique 30 minutos para dar o primeiro passo em algo importante que estava adiando.",
            "category": "productivity"
        }
    ],
    Modality.FIXED: [
        {
            "advice": "Sua estabilidade é um presente para outros. Hoje, seja conscientemente uma âncora emocional para alguém.",
            "reflection": "Quem ao seu redor poderia se beneficiar da sua presença estável e confiável?",
            "action": "Ofereça apoio consistente a uma pessoa que está passando por mudanças.",
            "category": "support"
        },
        {
            "advice": "Experimente algo pequeno e novo hoje. Sua zona de conforto pode se expandir com passos gentis.",
            "reflection": "Que mudança pequena e segura você poderia experimentar hoje?",
            "action": "Faça uma escolha diferente em algo rotineiro (caminho, comida, atividade).",
            "category": "growth"
        }
    ],
    Modality.MUTABLE: [
        {
            "advice": "Sua adaptabilidade é uma força. Hoje, use-a conscientemente para trazer harmonia a uma situação tensa.",
            "reflection": "Onde sua capacidade de mediar e adaptar pode fazer diferença hoje?",
            "action": "Identifique um conflito menor e atue como mediador pacífico.",
            "category": "harmony"
        },
        {
            "advice": "Pratique manter uma posição firme em algo importante para você. Sua flexibilidade não significa ausência de convicções.",
            "reflection": "Sobre que valores ou princípios você não deveria ser flexível?",
            "action": "Identifique uma situação onde você precisa ser firme e pratique essa firmeza gentil.",
            "category": "assertiveness"
        }
    ]
}

# Advanced Compatibility Matrix
TEMPERAMENT_COMPATIBILITY = {
    ("Colérico", "Colérico"): {
        "affinity": "Médio",
        "score": 65,
        "conflicts": ["Disputas pelo controle", "Ambos querem liderar", "Conflitos de ego"],
        "strengths": ["Alta energia", "Objetivos claros", "Decisões rápidas"],
        "weaknesses": ["Competitividade excessiva", "Falta de paciência mútua", "Tendência ao confronto"]
    },
    ("Colérico", "Sanguíneo"): {
        "affinity": "Alto",
        "score": 85,
        "conflicts": ["Colérico pode achar Sanguíneo desorganizado", "Sanguíneo pode se sentir pressionado"],
        "strengths": ["Complementaridade perfeita", "Energia + Entusiasmo", "Liderança + Carisma"],
        "weaknesses": ["Diferentes ritmos de trabalho", "Colérico muito sério vs Sanguíneo muito casual"]
    },
    ("Colérico", "Melancólico"): {
        "affinity": "Médio",
        "score": 70,
        "conflicts": ["Ritmos diferentes", "Colérico impaciente vs Melancólico cauteloso"],
        "strengths": ["Liderança + Análise", "Ação + Reflexão", "Objetivos + Qualidade"],
        "weaknesses": ["Colérico pode ser muito direto", "Melancólico pode ser muito crítico"]
    },
    ("Colérico", "Fleumático"): {
        "affinity": "Baixo",
        "score": 55,
        "conflicts": ["Colérico frustrado com lentidão", "Fleumático sobrecarregado pela intensidade"],
        "strengths": ["Liderança + Estabilidade", "Ação + Paciência"],
        "weaknesses": ["Ritmos completamente diferentes", "Comunicação pode ser difícil"]
    },
    ("Sanguíneo", "Sanguíneo"): {
        "affinity": "Alto",
        "score": 80,
        "conflicts": ["Desorganização dupla", "Dificuldade para tomar decisões sérias"],
        "strengths": ["Diversão garantida", "Sociabilidade", "Otimismo mútuo"],
        "weaknesses": ["Falta de praticidade", "Podem se distrair facilmente"]
    },
    ("Sanguíneo", "Melancólico"): {
        "affinity": "Médio",
        "score": 75,
        "conflicts": ["Sanguíneo muito casual vs Melancólico muito sério", "Diferentes abordagens sociais"],
        "strengths": ["Equilíbrio perfeito", "Espontaneidade + Planejamento", "Social + Profundo"],
        "weaknesses": ["Sanguíneo pode cansar Melancólico", "Melancólico pode frustrar Sanguíneo"]
    },
    ("Sanguíneo", "Fleumático"): {
        "affinity": "Alto",
        "score": 85,
        "conflicts": ["Sanguíneo pode achar Fleumático passivo", "Diferentes níveis de energia"],
        "strengths": ["Harmonia natural", "Sanguíneo anima, Fleumático acalma", "Complementaridade social"],
        "weaknesses": ["Sanguíneo pode dominar as decisões", "Fleumático pode se sentir negligenciado"]
    },
    ("Melancólico", "Melancólico"): {
        "affinity": "Médio",
        "score": 70,
        "conflicts": ["Críticas mútuas", "Pessimismo duplo", "Perfeccionismo excessivo"],
        "strengths": ["Compreensão profunda", "Valores similares", "Lealdade mútua"],
        "weaknesses": ["Podem se isolar socialmente", "Dificuldade para relaxar juntos"]
    },
    ("Melancólico", "Fleumático"): {
        "affinity": "Alto",
        "score": 90,
        "conflicts": ["Melancólico pode ser muito crítico", "Fleumático pode evitar discussões necessárias"],
        "strengths": ["Relacionamento estável", "Respeito mútuo", "Crescimento gradual"],
        "weaknesses": ["Podem ser muito cautelosos", "Falta de espontaneidade"]
    },
    ("Fleumático", "Fleumático"): {
        "affinity": "Médio",
        "score": 65,
        "conflicts": ["Falta de iniciativa", "Decisões podem demorar muito", "Passividade dupla"],
        "strengths": ["Paz e harmonia", "Evitam conflitos", "Relacionamento tranquilo"],
        "weaknesses": ["Falta de dinamismo", "Podem estagnar", "Dificuldade para mudanças"]
    }
}

ELEMENT_COMPATIBILITY = {
    ("Fogo", "Fogo"): {"multiplier": 1.1, "description": "Energia intensa, mas pode queimar"},
    ("Fogo", "Ar"): {"multiplier": 1.3, "description": "Ar alimenta o fogo - combinação poderosa"},
    ("Fogo", "Terra"): {"multiplier": 0.8, "description": "Terra pode sufocar o fogo"},
    ("Fogo", "Água"): {"multiplier": 0.6, "description": "Água apaga o fogo - opostos"},
    ("Ar", "Ar"): {"multiplier": 1.1, "description": "Conexão mental forte"},
    ("Ar", "Terra"): {"multiplier": 0.7, "description": "Ar dispersa, Terra fixa"},
    ("Ar", "Água"): {"multiplier": 0.8, "description": "Diferentes formas de fluidez"},
    ("Terra", "Terra"): {"multiplier": 1.2, "description": "Base sólida e estável"},
    ("Terra", "Água"): {"multiplier": 1.4, "description": "Água nutre a Terra - complementaridade perfeita"},
    ("Água", "Água"): {"multiplier": 1.1, "description": "Profundidade emocional intensa"}
}

QUALITY_COMPATIBILITY = {
    ("Cardinal", "Cardinal"): {"adjustment": -5, "note": "Ambos querem liderar"},
    ("Cardinal", "Fixo"): {"adjustment": 10, "note": "Cardinal inicia, Fixo sustenta"},
    ("Cardinal", "Mutável"): {"adjustment": 5, "note": "Cardinal dirige, Mutável adapta"},
    ("Fixo", "Fixo"): {"adjustment": 5, "note": "Muito estável, mas pode estagnar"},
    ("Fixo", "Mutável"): {"adjustment": 15, "note": "Fixo oferece base, Mutável traz mudança"},
    ("Mutável", "Mutável"): {"adjustment": -10, "note": "Falta de direção clara"}
}

def determine_zodiac_from_birth_date(birth_date_str: str) -> ZodiacSign:
    """Determine zodiac sign from birth date"""
    from datetime import datetime
    
    try:
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d")
        month = birth_date.month
        day = birth_date.day
        
        # Zodiac sign determination logic
        if (month == 3 and day >= 21) or (month == 4 and day <= 19):
            return ZodiacSign.ARIES
        elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
            return ZodiacSign.TAURUS
        elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
            return ZodiacSign.GEMINI
        elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
            return ZodiacSign.CANCER
        elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
            return ZodiacSign.LEO
        elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
            return ZodiacSign.VIRGO
        elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
            return ZodiacSign.LIBRA
        elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
            return ZodiacSign.SCORPIO
        elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
            return ZodiacSign.SAGITTARIUS
        elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
            return ZodiacSign.CAPRICORN
        elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
            return ZodiacSign.AQUARIUS
        else:  # Pisces
            return ZodiacSign.PISCES
            
    except Exception:
        return ZodiacSign.ARIES  # Default fallback

def calculate_enhanced_compatibility(user_profile: Dict, partner_profile: Dict) -> EnhancedCompatibilityReport:
    """Calculate comprehensive compatibility between two profiles"""
    
    # Get temperament compatibility
    temp_key = (user_profile["temperament"], partner_profile["temperament"])
    temp_compat = TEMPERAMENT_COMPATIBILITY.get(temp_key, TEMPERAMENT_COMPATIBILITY.get((temp_key[1], temp_key[0])))
    
    if not temp_compat:
        # Fallback for missing combinations
        temp_compat = {
            "affinity": "Médio",
            "score": 70,
            "conflicts": ["Necessária análise mais detalhada"],
            "strengths": ["Potencial para crescimento mútuo"],
            "weaknesses": ["Requer trabalho de comunicação"]
        }
    
    base_score = temp_compat["score"]
    
    # Apply element compatibility multiplier
    element_key = (user_profile["element_pt"], partner_profile["element_pt"])
    element_compat = ELEMENT_COMPATIBILITY.get(element_key, ELEMENT_COMPATIBILITY.get((element_key[1], element_key[0])))
    
    if element_compat:
        base_score = int(base_score * element_compat["multiplier"])
    
    # Apply quality compatibility adjustment
    quality_key = (user_profile["quality"], partner_profile["quality"])
    quality_compat = QUALITY_COMPATIBILITY.get(quality_key, QUALITY_COMPATIBILITY.get((quality_key[1], quality_key[0])))
    
    if quality_compat:
        base_score += quality_compat["adjustment"]
    
    # Ensure score is within bounds
    final_score = max(1, min(100, base_score))
    
    # Determine general affinity
    if final_score >= 80:
        general_affinity = "Alto"
    elif final_score >= 60:
        general_affinity = "Médio"  
    else:
        general_affinity = "Baixo"
    
    # Generate detailed analysis
    detailed_analysis = {
        "temperament_analysis": f"Combinação {user_profile['temperament']} + {partner_profile['temperament']}: {temp_compat['affinity']} potencial de harmonia",
        "element_analysis": f"Elementos {user_profile['element_pt']} + {partner_profile['element_pt']}: {element_compat['description'] if element_compat else 'Necessita análise específica'}",
        "quality_analysis": f"Qualidades {user_profile['quality']} + {partner_profile['quality']}: {quality_compat['note'] if quality_compat else 'Dinâmica neutra'}"
    }
    
    # Enhanced recommendations
    recommendations = [
        f"{user_profile['name']}: Desenvolva {TEMPERAMENT_DESCRIPTIONS[user_profile['temperament']]['traits'][0].lower()}",
        f"{partner_profile['name']}: Trabalhe em {TEMPERAMENT_DESCRIPTIONS[partner_profile['temperament']]['traits'][1].lower()}",
        "Pratiquem comunicação baseada na compreensão dos temperamentos",
        "Usem as diferenças como complementaridade, não como obstáculos"
    ]
    
    return EnhancedCompatibilityReport(
        user_id="",  # Will be set by caller
        partner_id="",  # Will be set by caller
        user_profile=user_profile,
        partner_profile=partner_profile,
        general_affinity=general_affinity,
        compatibility_score=final_score,
        potential_conflicts=temp_compat["conflicts"],
        strength_points=temp_compat["strengths"],
        weakness_points=temp_compat["weaknesses"],
        detailed_analysis=detailed_analysis,
        recommendations=recommendations
    )

# Weekly Missions
WEEKLY_MISSIONS_TEMPLATE = [
    WeeklyMission(
        title="Descoberta do Eu Interior",
        description="Complete o questionário de autoconhecimento para descobrir insights profundos sobre sua personalidade",
        points=100,
        week_number=1,
        year=2025,
        mission_type="self_knowledge"
    ),
    WeeklyMission(
        title="Comunicação Assertiva",
        description="Pratique uma conversa profunda com seu parceiro usando as técnicas do seu temperamento",
        points=150,
        week_number=2,
        year=2025,
        mission_type="communication"
    ),
    WeeklyMission(
        title="Exercício de Empatia",
        description="Identifique e pratique uma característica do temperamento do seu parceiro",
        points=200,
        week_number=3,
        year=2025,
        mission_type="exercise"
    ),
    WeeklyMission(
        title="Resolução Harmoniosa",
        description="Aplique as estratégias de resolução de conflitos específicas para sua combinação de temperamentos",
        points=250,
        week_number=4,
        year=2025,
        mission_type="communication"
    )
]

# Questionnaire Questions
QUESTIONNAIRE_QUESTIONS = [
    {
        "id": 1,
        "question": "Como você prefere tomar decisões importantes?",
        "options": [
            {"answer": "Ajo rapidamente e lidero a situação", "modality": "cardinal", "score": 3},
            {"answer": "Penso bem e mantenho minha posição", "modality": "fixed", "score": 3},
            {"answer": "Me adapto conforme as circunstâncias", "modality": "mutable", "score": 3}
        ]
    },
    {
        "id": 2,
        "question": "Em um relacionamento, você:",
        "options": [
            {"answer": "Gosta de iniciar novos projetos juntos", "modality": "cardinal", "score": 3},
            {"answer": "Valoriza estabilidade e lealdade", "modality": "fixed", "score": 3},
            {"answer": "Se adapta facilmente às necessidades do parceiro", "modality": "mutable", "score": 3}
        ]
    },
    {
        "id": 3,
        "question": "Quando há conflitos, você:",
        "options": [
            {"answer": "Enfrenta de frente e busca resolver rapidamente", "modality": "cardinal", "score": 3},
            {"answer": "Mantém sua posição com firmeza", "modality": "fixed", "score": 3},
            {"answer": "Procura um meio-termo e flexibiliza", "modality": "mutable", "score": 3}
        ]
    },
    {
        "id": 4,
        "question": "Sua abordagem para mudanças é:",
        "options": [
            {"answer": "Sou o primeiro a iniciar mudanças", "modality": "cardinal", "score": 3},
            {"answer": "Prefiro estabilidade e resisto a mudanças", "modality": "fixed", "score": 3},
            {"answer": "Me adapto facilmente a qualquer mudança", "modality": "mutable", "score": 3}
        ]
    },
    {
        "id": 5,
        "question": "No trabalho em equipe, você:",
        "options": [
            {"answer": "Naturalmente assume a liderança", "modality": "cardinal", "score": 3},
            {"answer": "Oferece suporte sólido e constante", "modality": "fixed", "score": 3},
            {"answer": "Se adapta ao que o grupo precisa", "modality": "mutable", "score": 3}
        ]
    }
]

def calculate_modality_scores(answers: List[QuestionnaireAnswer]) -> Dict[str, int]:
    scores = {"cardinal": 0, "fixed": 0, "mutable": 0}
    
    for answer in answers:
        question = next((q for q in QUESTIONNAIRE_QUESTIONS if q["id"] == answer.question_id), None)
        if question:
            option = next((opt for opt in question["options"] if opt["answer"] == answer.answer), None)
            if option:
                scores[option["modality"]] += option["score"]
    
    return scores

def get_dominant_modality(scores: Dict[str, int]) -> tuple:
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    dominant = sorted_scores[0][0]
    secondary = sorted_scores[1][0] if len(sorted_scores) > 1 and sorted_scores[1][1] > 0 else None
    return dominant, secondary

def calculate_compatibility(user1: User, user2: User, result1: QuestionnaireResult, result2: QuestionnaireResult) -> CompatibilityReport:
    # Enhanced compatibility logic
    sign1_data = ZODIAC_DATA[user1.zodiac_sign]
    sign2_data = ZODIAC_DATA[user2.zodiac_sign]
    
    base_score = 50
    
    # Same modality bonus/penalty
    if result1.dominant_modality == result2.dominant_modality:
        base_score += 15
    
    # Element compatibility (enhanced)
    element_compatibility = {
        ("fire", "air"): 20,    # Fire needs air
        ("earth", "water"): 20, # Earth needs water
        ("fire", "fire"): 15,   # High energy
        ("air", "air"): 15,     # Mental connection
        ("earth", "earth"): 15, # Stable foundation
        ("water", "water"): 15, # Emotional depth
        ("fire", "earth"): 8,   # Complementary but challenging
        ("air", "water"): 8,    # Different approaches
        ("fire", "water"): 5,   # Steam - can work with effort
        ("earth", "air"): 5,    # Different priorities
    }
    
    element_pair = (sign1_data["element"], sign2_data["element"])
    if element_pair in element_compatibility:
        base_score += element_compatibility[element_pair]
    elif (element_pair[1], element_pair[0]) in element_compatibility:
        base_score += element_compatibility[(element_pair[1], element_pair[0])]
    
    base_score = max(15, min(100, base_score))
    
    # Generate detailed insights based on modalities
    strengths = []
    challenges = []
    recommendations = []
    dynamics = []
    
    modality1 = result1.dominant_modality
    modality2 = result2.dominant_modality
    
    if modality1 == Modality.CARDINAL and modality2 == Modality.CARDINAL:
        strengths.extend([
            "Ambos são líderes naturais com visão de futuro",
            "Energia alta e motivação mútua para conquistas",
            "Capacidade de iniciar projetos juntos rapidamente"
        ])
        challenges.extend([
            "Competição por liderança pode gerar conflitos",
            "Impaciência mútua em discussões longas",
            "Dificuldade em ouvir o outro quando ambos querem liderar"
        ])
        recommendations.extend([
            "Dividam responsabilidades por área de expertise",
            "Estabeleçam turnos para liderar diferentes situações",
            "Pratiquem exercícios de escuta ativa diariamente"
        ])
        dynamics.append("Vocês tendem a resolver conflitos rapidamente, mas podem criar novos se não respeitarem o espaço de liderança de cada um.")
        
    elif modality1 == Modality.FIXED and modality2 == Modality.FIXED:
        strengths.extend([
            "Relacionamento extremamente estável e duradouro",
            "Lealdade inabalável entre vocês",
            "Construção sólida de tradições e rituais de casal"
        ])
        challenges.extend([
            "Resistência mútua a mudanças necessárias",
            "Teimosia pode prolongar conflitos desnecessariamente",
            "Dificuldade para se adaptar a novos desafios juntos"
        ])
        recommendations.extend([
            "Estabeleçam 'dias de experimentação' mensais",
            "Pratiquem pequenas mudanças gradualmente",
            "Celebrem as tradições, mas abracem novidades ocasionalmente"
        ])
        dynamics.append("Vocês constroem algo sólido juntos, mas precisam cultivar flexibilidade para crescer como casal.")
        
    elif modality1 == Modality.MUTABLE and modality2 == Modality.MUTABLE:
        strengths.extend([
            "Adaptabilidade excepcional às mudanças da vida",
            "Compreensão mútua e empatia natural",
            "Flexibilidade para resolver problemas criativamente"
        ])
        challenges.extend([
            "Falta de direção clara e metas definidas",
            "Indecisão mútua pode paralisar decisões importantes",
            "Evitação de conflitos pode acumular ressentimentos"
        ])
        recommendations.extend([
            "Definam metas trimestrais juntos",
            "Pratiquem tomar decisões em prazos definidos",
            "Abordem conflitos pequenos antes que cresçam"
        ])
        dynamics.append("Vocês fluem bem juntos, mas precisam criar estrutura para não se perderem em indecisões.")
        
    elif (modality1 == Modality.CARDINAL and modality2 == Modality.FIXED) or (modality1 == Modality.FIXED and modality2 == Modality.CARDINAL):
        cardinal_name = user1.name if modality1 == Modality.CARDINAL else user2.name
        fixed_name = user2.name if modality1 == Modality.CARDINAL else user1.name
        
        strengths.extend([
            f"{cardinal_name} traz energia e novidades, {fixed_name} oferece estabilidade",
            "Combinação poderosa de iniciativa e persistência",
            "O estável apoia o iniciador, criando base sólida para projetos"
        ])
        challenges.extend([
            f"{cardinal_name} pode se frustrar com o ritmo de {fixed_name}",
            f"{fixed_name} pode se sentir pressionado pela urgência de {cardinal_name}",
            "Conflitos entre velocidade (Cardinal) e estabilidade (Fixo)"
        ])
        recommendations.extend([
            f"{cardinal_name}: respeite o tempo de processamento de {fixed_name}",
            f"{fixed_name}: tente ser mais aberto a mudanças propostas por {cardinal_name}",
            "Encontrem um ritmo que honre ambas as necessidades"
        ])
        dynamics.append(f"{cardinal_name} inicia, {fixed_name} sustenta - uma parceria complementar que funciona quando há respeito mútuo pelos ritmos diferentes.")
        
    elif (modality1 == Modality.CARDINAL and modality2 == Modality.MUTABLE) or (modality1 == Modality.MUTABLE and modality2 == Modality.CARDINAL):
        cardinal_name = user1.name if modality1 == Modality.CARDINAL else user2.name
        mutable_name = user2.name if modality1 == Modality.CARDINAL else user1.name
        
        strengths.extend([
            f"{cardinal_name} lidera com visão, {mutable_name} adapta com sabedoria",
            "Excelente capacidade de inovação e ajuste",
            "Dinamismo equilibrado entre ação e flexibilidade"
        ])
        challenges.extend([
            f"{cardinal_name} pode ver {mutable_name} como indeciso",
            f"{mutable_name} pode se sentir pressionado pela assertividade de {cardinal_name}",
            "Ritmos diferentes podem causar desencontros"
        ])
        recommendations.extend([
            f"{cardinal_name}: dê espaço para {mutable_name} processar e contribuir",
            f"{mutable_name}: pratique ser mais direto com suas opiniões",
            "Combinem sessões de planejamento com momentos de espontaneidade"
        ])
        dynamics.append(f"{cardinal_name} propõe direções, {mutable_name} encontra os melhores caminhos - uma dupla criativa e eficiente.")
        
    elif (modality1 == Modality.FIXED and modality2 == Modality.MUTABLE) or (modality1 == Modality.MUTABLE and modality2 == Modality.FIXED):
        fixed_name = user1.name if modality1 == Modality.FIXED else user2.name
        mutable_name = user2.name if modality1 == Modality.FIXED else user1.name
        
        strengths.extend([
            f"{fixed_name} oferece base sólida, {mutable_name} traz versatilidade",
            "Equilíbrio perfeito entre estabilidade e adaptabilidade",
            "Complementaridade natural que cobre diferentes necessidades"
        ])
        challenges.extend([
            f"{fixed_name} pode ver {mutable_name} como inconsistente",
            f"{mutable_name} pode se sentir limitado pela rigidez de {fixed_name}",
            "Necessidades diferentes de mudança vs. estabilidade"
        ])
        recommendations.extend([
            f"{fixed_name}: aprecie a flexibilidade de {mutable_name} como um presente",
            f"{mutable_name}: valorize a constância de {fixed_name} como segurança",
            "Criem rotinas flexíveis que satisfaçam ambos"
        ])
        dynamics.append(f"{fixed_name} é a âncora, {mutable_name} é a vela - juntos navegam com segurança e adaptabilidade.")
    
    # Enhanced premium insights
    premium_insights = [
        f"Guia personalizado de comunicação para {modality1.value}-{modality2.value}",
        f"Exercícios específicos para fortalecer a dinâmica {user1.name}-{user2.name}",
        "Plano de desenvolvimento do relacionamento em 90 dias",
        "Estratégias de intimidade baseadas nos temperamentos",
        "Toolkit de resolução de conflitos personalizado",
        "Rituais de conexão adaptados ao perfil do casal"
    ]
    
    return CompatibilityReport(
        user1_id=user1.id,
        user2_id=user2.id,
        compatibility_score=base_score,
        strengths=strengths,
        challenges=challenges,
        recommendations=recommendations,
        premium_insights=premium_insights
    )

# API Routes
@api_router.get("/")
async def root():
    return {"message": "API de Temperamentos no Relacionamento"}

@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    user_dict = user_data.dict()
    user = User(**user_dict)
    user.badges.append(BadgeType.PROFILE_CREATED)
    user.progress_percentage = 25
    
    # Prepare for MongoDB
    user_mongo = user.dict()
    user_mongo['created_at'] = user_mongo['created_at'].isoformat()
    
    await db.users.insert_one(user_mongo)
    return user

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Parse from MongoDB
    if isinstance(user_data.get('created_at'), str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    
    return User(**user_data)

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(length=100)
    parsed_users = []
    
    for user_data in users:
        # Parse from MongoDB
        if isinstance(user_data.get('created_at'), str):
            user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
        parsed_users.append(User(**user_data))
    
    return parsed_users

@api_router.get("/questionnaire")
async def get_questionnaire():
    return {"questions": QUESTIONNAIRE_QUESTIONS}

@api_router.post("/questionnaire/submit", response_model=QuestionnaireResult)
async def submit_questionnaire(submission: QuestionnaireSubmission):
    # Calculate modality scores
    scores = calculate_modality_scores(submission.answers)
    dominant, secondary = get_dominant_modality(scores)
    
    result = QuestionnaireResult(
        user_id=submission.user_id,
        answers=submission.answers,
        dominant_modality=Modality(dominant),
        secondary_modality=Modality(secondary) if secondary else None
    )
    
    # Update user progress and badge
    user_data = await db.users.find_one({"id": submission.user_id})
    if user_data:
        badges = user_data.get('badges', [])
        if BadgeType.QUESTIONNAIRE_COMPLETED not in badges:
            badges.append(BadgeType.QUESTIONNAIRE_COMPLETED)
            await db.users.update_one(
                {"id": submission.user_id},
                {"$set": {"badges": badges, "progress_percentage": 50}}
            )
    
    # Store result
    result_mongo = result.dict()
    result_mongo['completed_at'] = result_mongo['completed_at'].isoformat()
    await db.questionnaire_results.insert_one(result_mongo)
    
    return result

@api_router.post("/compatibility", response_model=CompatibilityReport)
async def generate_compatibility_report(request: CompatibilityRequest):
    # Get users
    user1_data = await db.users.find_one({"id": request.user1_id})
    user2_data = await db.users.find_one({"id": request.user2_id})
    
    if not user1_data or not user2_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Parse users
    if isinstance(user1_data.get('created_at'), str):
        user1_data['created_at'] = datetime.fromisoformat(user1_data['created_at'])
    if isinstance(user2_data.get('created_at'), str):
        user2_data['created_at'] = datetime.fromisoformat(user2_data['created_at'])
    
    user1 = User(**user1_data)
    user2 = User(**user2_data)
    
    # Get questionnaire results
    result1_data = await db.questionnaire_results.find_one({"user_id": request.user1_id})
    result2_data = await db.questionnaire_results.find_one({"user_id": request.user2_id})
    
    if not result1_data or not result2_data:
        raise HTTPException(status_code=404, detail="Questionário não encontrado para um dos usuários")
    
    # Parse results
    if isinstance(result1_data.get('completed_at'), str):
        result1_data['completed_at'] = datetime.fromisoformat(result1_data['completed_at'])
    if isinstance(result2_data.get('completed_at'), str):
        result2_data['completed_at'] = datetime.fromisoformat(result2_data['completed_at'])
    
    result1 = QuestionnaireResult(**result1_data)
    result2 = QuestionnaireResult(**result2_data)
    
    # Generate compatibility report
    report = calculate_compatibility(user1, user2, result1, result2)
    
    # Update user progress and badges
    for user_id in [request.user1_id, request.user2_id]:
        user_data = await db.users.find_one({"id": user_id})
        if user_data:
            badges = user_data.get('badges', [])
            if BadgeType.REPORT_GENERATED not in badges:
                badges.append(BadgeType.REPORT_GENERATED)
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {"badges": badges, "progress_percentage": 75}}
                )
    
    # Store report
    report_mongo = report.dict()
    report_mongo['created_at'] = report_mongo['created_at'].isoformat()
    await db.compatibility_reports.insert_one(report_mongo)
    
    return report

@api_router.post("/users/{user_id}/share")
async def share_with_partner(user_id: str):
    # Update user badge and progress
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    badges = user_data.get('badges', [])
    if BadgeType.SHARED_WITH_PARTNER not in badges:
        badges.append(BadgeType.SHARED_WITH_PARTNER)
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"badges": badges, "progress_percentage": 100}}
        )
    
    return {"message": "Conquista desbloqueada: Compartilhou com parceiro!"}

@api_router.post("/users/{user_id}/upgrade-premium")
async def upgrade_to_premium(user_id: str):
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_premium": True}}
    )
    return {"message": "Upgrade para Premium realizado com sucesso!"}

@api_router.get("/zodiac-signs")
async def get_zodiac_signs():
    return {"signs": ZODIAC_DATA}

# Premium Content Routes
@api_router.get("/premium/temperament-profiles")
async def get_temperament_profiles():
    return {"profiles": {k.value: v.dict() for k, v in TEMPERAMENT_PROFILES.items()}}

@api_router.get("/premium/temperament-profile/{modality}")
async def get_temperament_profile(modality: Modality):
    if modality in TEMPERAMENT_PROFILES:
        return TEMPERAMENT_PROFILES[modality]
    raise HTTPException(status_code=404, detail="Perfil de temperamento não encontrado")

@api_router.get("/premium/self-knowledge-questions")
async def get_self_knowledge_questions():
    return {"questions": [q.dict() for q in SELF_KNOWLEDGE_QUESTIONS]}

@api_router.post("/premium/self-knowledge/submit")
async def submit_self_knowledge(user_id: str, answers: List[SelfKnowledgeAnswer]):
    # Calculate insights based on answers
    insights = {}
    categories = {}
    
    for answer in answers:
        if answer.category not in categories:
            categories[answer.category] = {"cardinal": 0, "fixed": 0, "mutable": 0}
        
        # Find the question and get modality
        question = next((q for q in SELF_KNOWLEDGE_QUESTIONS if q.id == answer.question_id), None)
        if question:
            option = next((opt for opt in question.options if opt["answer"] == answer.answer), None)
            if option:
                categories[answer.category][option["modality"]] += answer.score
    
    # Generate insights for each category
    for category, scores in categories.items():
        dominant = max(scores, key=scores.get)
        if category == "communication":
            if dominant == "cardinal":
                insights[category] = "Você tem um estilo de comunicação direto e assertivo. Foque em desenvolver mais paciência e escuta ativa."
            elif dominant == "fixed":
                insights[category] = "Sua comunicação é estável e profunda. Pratique expressar sentimentos mais abertamente."
            else:
                insights[category] = "Você se adapta bem na comunicação. Desenvolva mais assertividade quando necessário."
        elif category == "conflict":
            if dominant == "cardinal":
                insights[category] = "Você enfrenta conflitos diretamente. Aprenda a dar tempo para o parceiro processar."
            elif dominant == "fixed":
                insights[category] = "Você mantém suas posições com firmeza. Pratique mais flexibilidade em questões menores."
            else:
                insights[category] = "Você busca harmonia nos conflitos. Às vezes é preciso ser mais firme em questões importantes."
        elif category == "intimacy":
            if dominant == "cardinal":
                insights[category] = "Você é apaixonado e intenso na intimidade. Equilibre momentos de intensidade com calma."
            elif dominant == "fixed":
                insights[category] = "Você constrói intimidade através da lealdade. Explore mais espontaneidade na relação."
            else:
                insights[category] = "Você se adapta às necessidades do parceiro. Lembre-se de expressar suas próprias necessidades também."
        elif category == "decision_making":
            if dominant == "cardinal":
                insights[category] = "Você toma decisões rapidamente. Às vezes vale a pena consultar mais o parceiro."
            elif dominant == "fixed":
                insights[category] = "Você pondera bem as decisões. Pratique mais agilidade em decisões menores."
            else:
                insights[category] = "Você considera múltiplas perspectivas. Desenvolva mais confiança em suas escolhas."
    
    # Store result
    result = SelfKnowledgeResult(
        user_id=user_id,
        answers=answers,
        insights=insights
    )
    
    result_mongo = result.dict()
    result_mongo['completed_at'] = result_mongo['completed_at'].isoformat()
    await db.self_knowledge_results.insert_one(result_mongo)
    
    # Award points and update progress
    await award_points(user_id, 100, "Questionário de Autoconhecimento Completo")
    
    return result

@api_router.get("/premium/weekly-missions/{user_id}")
async def get_weekly_missions(user_id: str):
    # Get current week
    from datetime import datetime
    now = datetime.now()
    current_week = now.isocalendar()[1]
    current_year = now.year
    
    # Create missions for current week if not exist
    missions = []
    for i, template in enumerate(WEEKLY_MISSIONS_TEMPLATE):
        mission = WeeklyMission(
            id=f"mission_{current_year}_{current_week}_{i+1}",
            title=template.title,
            description=template.description,
            points=template.points,
            week_number=current_week,
            year=current_year,
            mission_type=template.mission_type
        )
        missions.append(mission)
        
        # Check if user has this mission
        user_mission_data = await db.user_missions.find_one({
            "user_id": user_id,
            "mission_id": mission.id
        })
        
        if not user_mission_data:
            # Create user mission record
            user_mission = UserMission(
                user_id=user_id,
                mission_id=mission.id
            )
            user_mission_mongo = user_mission.dict()
            await db.user_missions.insert_one(user_mission_mongo)
    
    # Get user mission progress
    user_missions = await db.user_missions.find({"user_id": user_id}).to_list(length=None)
    
    # Combine missions with progress
    result = []
    for mission in missions:
        user_mission = next((um for um in user_missions if um["mission_id"] == mission.id), None)
        mission_data = mission.dict()
        mission_data["completed"] = user_mission["completed"] if user_mission else False
        mission_data["completed_at"] = user_mission.get("completed_at") if user_mission else None
        result.append(mission_data)
    
    return {"missions": result}

@api_router.post("/premium/complete-mission/{user_id}/{mission_id}")
async def complete_mission(user_id: str, mission_id: str):
    # Find mission
    mission_data = await db.user_missions.find_one({
        "user_id": user_id,
        "mission_id": mission_id
    })
    
    if not mission_data:
        raise HTTPException(status_code=404, detail="Missão não encontrada")
    
    if mission_data["completed"]:
        return {"message": "Missão já foi completada"}
    
    # Complete mission
    await db.user_missions.update_one(
        {"user_id": user_id, "mission_id": mission_id},
        {
            "$set": {
                "completed": True,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Find mission points
    mission_points = 100  # default
    for template in WEEKLY_MISSIONS_TEMPLATE:
        if template.title in mission_id:
            mission_points = template.points
            break
    
    # Award points
    await award_points(user_id, mission_points, f"Missão Completada")
    
    return {"message": "Missão completada com sucesso!", "points_earned": mission_points}

@api_router.get("/premium/user-progress/{user_id}")
async def get_user_progress(user_id: str):
    progress_data = await db.user_progress.find_one({"user_id": user_id})
    
    if not progress_data:
        # Create initial progress
        progress = UserProgress(user_id=user_id)
        progress_mongo = progress.dict()
        progress_mongo['last_activity'] = progress_mongo['last_activity'].isoformat()
        await db.user_progress.insert_one(progress_mongo)
        return progress
    
    # Parse from MongoDB
    if isinstance(progress_data.get('last_activity'), str):
        progress_data['last_activity'] = datetime.fromisoformat(progress_data['last_activity'])
    
    return UserProgress(**progress_data)

@api_router.get("/premium/couple-exercises/{user_id}")
async def get_couple_exercises_with_progress(user_id: str):
    # Get user's exercise progress
    user_progress = await db.exercise_progress.find({"user_id": user_id}).to_list(length=None)
    
    exercises_with_progress = []
    for exercise in COUPLE_EXERCISES:
        # Find progress for this exercise
        progress = next((p for p in user_progress if p["exercise_title"] == exercise.title), None)
        
        # Determine if exercise is unlocked based on gamification rules
        is_unlocked = is_exercise_unlocked(exercise.difficulty_level, user_progress)
        
        exercise_data = exercise.dict()
        exercise_data.update({
            "is_unlocked": is_unlocked,
            "is_completed": progress["completed"] if progress else False,
            "has_feedback": bool(progress and progress.get("feedback")) if progress else False,
            "completed_at": progress.get("completed_at") if progress else None
        })
        
        exercises_with_progress.append(exercise_data)
    
    return {"exercises": exercises_with_progress}

@api_router.get("/premium/couple-exercise/{exercise_id}")
async def get_couple_exercise(exercise_id: str):
    # Find exercise by title (simplified for demo)
    exercise = next((ex for ex in COUPLE_EXERCISES if ex.title.lower().replace(" ", "_") in exercise_id), None)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    return exercise

@api_router.post("/premium/complete-exercise")
async def complete_exercise(user_id: str, exercise_title: str, feedback: str):
    # Find the exercise
    exercise = next((ex for ex in COUPLE_EXERCISES if ex.title == exercise_title), None)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercício não encontrado")
    
    # Check if exercise is unlocked
    user_progress = await db.exercise_progress.find({"user_id": user_id}).to_list(length=None)
    if not is_exercise_unlocked(exercise.difficulty_level, user_progress):
        raise HTTPException(status_code=403, detail="Exercício ainda não está desbloqueado")
    
    # Check if already completed
    existing_progress = await db.exercise_progress.find_one({
        "user_id": user_id,
        "exercise_title": exercise_title
    })
    
    if existing_progress and existing_progress.get("completed"):
        raise HTTPException(status_code=400, detail="Exercício já foi completado")
    
    # Create or update progress
    progress_data = {
        "user_id": user_id,
        "exercise_title": exercise_title,
        "difficulty_level": exercise.difficulty_level,
        "completed": True,
        "feedback": feedback,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    if existing_progress:
        await db.exercise_progress.update_one(
            {"user_id": user_id, "exercise_title": exercise_title},
            {"$set": progress_data}
        )
    else:
        progress_data["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.exercise_progress.insert_one(progress_data)
    
    # Award points based on difficulty level
    points = exercise.difficulty_level * 50  # 50, 100, 150, 200, 250 points
    await award_points(user_id, points, f"Exercício Completado: {exercise_title}")
    
    return {
        "message": "Exercício completado com sucesso!",
        "points_earned": points,
        "next_unlocked": get_next_unlocked_exercise(exercise.difficulty_level)
    }

def is_exercise_unlocked(difficulty_level: int, user_progress: List[Dict]) -> bool:
    """Check if an exercise is unlocked based on gamification rules"""
    if difficulty_level == 1:  # Iniciante is always unlocked
        return True
    
    # For other levels, check if previous level is completed with feedback
    previous_level = difficulty_level - 1
    previous_completed = any(
        p["difficulty_level"] == previous_level and 
        p["completed"] and 
        p.get("feedback") 
        for p in user_progress
    )
    
    return previous_completed

def get_next_unlocked_exercise(completed_difficulty: int) -> Optional[str]:
    """Get the title of the next exercise that was unlocked"""
    next_level = completed_difficulty + 1
    next_exercise = next((ex for ex in COUPLE_EXERCISES if ex.difficulty_level == next_level), None)
    return next_exercise.title if next_exercise else None

@api_router.get("/premium/journey-levels/{user_id}")
async def get_user_journey_levels(user_id: str):
    # Get user progress to determine unlocked levels
    user_data = await db.users.find_one({"id": user_id})
    progress_data = await db.user_progress.find_one({"user_id": user_id})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Determine unlocked levels based on user achievements
    user_badges = user_data.get("badges", [])
    user_level = progress_data.get("current_level", 1) if progress_data else 1
    
    unlocked_levels = []
    for level in JOURNEY_LEVELS:
        is_unlocked = True
        requirements = level.unlock_requirements
        
        # Check requirements
        if "profile_created" in requirements and "profile_created" not in user_badges:
            is_unlocked = False
        if "questionnaire_completed" in requirements and "questionnaire_completed" not in user_badges:
            is_unlocked = False
        if "compatibility_report" in requirements and "report_generated" not in user_badges:
            is_unlocked = False
        
        level_data = level.dict()
        level_data["is_unlocked"] = is_unlocked
        level_data["is_current"] = level.level == user_level
        unlocked_levels.append(level_data)
    
    return {"levels": unlocked_levels, "current_level": user_level}

@api_router.get("/premium/daily-advice/{user_id}")
async def get_daily_advice(user_id: str):
    # Get user's dominant modality
    result_data = await db.questionnaire_results.find_one({"user_id": user_id})
    if not result_data:
        # Default advice for users without questionnaire
        modality = Modality.CARDINAL
    else:
        modality = Modality(result_data.get("dominant_modality", "cardinal"))
    
    # Get today's date
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Check if advice already exists for today
    existing_advice = await db.daily_advice.find_one({"user_id": user_id, "date": today})
    if existing_advice:
        if isinstance(existing_advice.get('date'), str):
            return DailyAdvice(**existing_advice)
    
    # Generate new advice
    import random
    advice_template = random.choice(DAILY_ADVICE_TEMPLATES[modality])
    
    daily_advice = DailyAdvice(
        user_id=user_id,
        modality=modality,
        advice_text=advice_template["advice"],
        reflection_question=advice_template["reflection"],
        action_item=advice_template["action"],
        category=advice_template["category"],
        date=today
    )
    
    # Save to database
    advice_mongo = daily_advice.dict()
    await db.daily_advice.insert_one(advice_mongo)
    
    return daily_advice

@api_router.get("/premium/advanced-questions")
async def get_advanced_self_knowledge_questions():
    return {"questions": [q.dict() for q in ADVANCED_SELF_KNOWLEDGE]}

@api_router.post("/premium/generate-report/{user_id}")
async def generate_personalized_report(user_id: str, report_type: str = "weekly_progress"):
    # Get user data and progress
    user_data = await db.users.find_one({"id": user_id})
    progress_data = await db.user_progress.find_one({"user_id": user_id})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user_badges = user_data.get("badges", [])
    total_points = progress_data.get("total_points", 0) if progress_data else 0
    current_level = progress_data.get("current_level", 1) if progress_data else 1
    
    # Generate personalized insights
    insights = []
    growth_areas = []
    achievements = []
    next_steps = []
    
    # Analyze progress
    if "profile_created" in user_badges:
        achievements.append("✅ Perfil criado com sucesso - Jornada de autoconhecimento iniciada")
    if "questionnaire_completed" in user_badges:
        achievements.append("✅ Temperamento descoberto - Base sólida para crescimento")
        insights.append("Seu temperamento fornece insights valiosos sobre seus padrões naturais")
    if "report_generated" in user_badges:
        achievements.append("✅ Compatibilidade analisada - Entendimento da dinâmica do casal")
    if "shared_with_partner" in user_badges:
        achievements.append("✅ Compartilhamento realizado - Transparência no relacionamento")
    
    # Growth areas based on level
    if current_level == 1:
        growth_areas.append("Autoconhecimento mais profundo através de reflexões diárias")
        next_steps.append("Complete os exercícios de autoconhecimento avançado")
    elif current_level >= 2:
        growth_areas.append("Aprofundamento da comunicação no relacionamento")
        next_steps.append("Pratique os exercícios de casal semanalmente")
    
    # Custom advice based on temperament
    result_data = await db.questionnaire_results.find_one({"user_id": user_id})
    if result_data:
        modality = result_data.get("dominant_modality", "cardinal")
        if modality == "cardinal":
            insights.append("Como Cardinal, você tem potencial natural de liderança no relacionamento")
            growth_areas.append("Desenvolver paciência e habilidades de escuta ativa")
        elif modality == "fixed":
            insights.append("Como Fixo, você oferece estabilidade e lealdade ao relacionamento")
            growth_areas.append("Cultivar flexibilidade e abertura para novas experiências")
        elif modality == "mutable":
            insights.append("Como Mutável, você traz adaptabilidade e harmonia ao relacionamento")
            growth_areas.append("Desenvolver assertividade e manter posições importantes")
    
    custom_advice = f"Com {total_points} pontos conquistados e no nível {current_level}, você está no caminho certo para um relacionamento mais consciente e conectado."
    
    # Create report
    report = PersonalizedReport(
        user_id=user_id,
        report_type=report_type,
        insights=insights,
        growth_areas=growth_areas,
        achievements=achievements,
        next_steps=next_steps,
        custom_advice=custom_advice
    )
    
    # Save to database
    report_mongo = report.dict()
    report_mongo['generated_at'] = report_mongo['generated_at'].isoformat()
    await db.personalized_reports.insert_one(report_mongo)
    
    return report

# Partner and Enhanced Compatibility Routes
@api_router.post("/partners", response_model=PartnerProfile)
async def create_partner(user_id: str, partner_data: PartnerCreate):
    # Check user status and partner limits
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Count existing partners
    existing_partners_count = await db.partners.count_documents({"user_id": user_id})
    
    # Check limits based on premium status
    is_premium = user_data.get("is_premium", False)
    max_partners = 4 if is_premium else 1  # Premium: 4 partners, Free: 1 partner
    
    if existing_partners_count >= max_partners:
        if is_premium:
            raise HTTPException(
                status_code=400, 
                detail=f"Limite de {max_partners} parceiros atingido para usuários Premium"
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail="Usuários gratuitos podem adicionar apenas 1 parceiro. Faça upgrade para Premium e adicione até 4 parceiros!"
            )
    
    # Determine zodiac sign from birth date
    zodiac_sign = determine_zodiac_from_birth_date(partner_data.birth_date)
    zodiac_data = ZODIAC_DATA[zodiac_sign]
    
    # Create partner profile
    partner = PartnerProfile(
        user_id=user_id,
        name=partner_data.name,
        birth_date=partner_data.birth_date,
        questionnaire_answers=partner_data.answers,
        zodiac_sign=zodiac_sign,
        temperament=zodiac_data["temperament"],
        element=zodiac_data["element_pt"],
        quality=zodiac_data["quality"]
    )
    
    # Store in database
    partner_mongo = partner.dict()
    partner_mongo['created_at'] = partner_mongo['created_at'].isoformat()
    await db.partners.insert_one(partner_mongo)
    
    # Award points for creating first connection (only for first partner)
    if existing_partners_count == 0:
        await award_points(user_id, 150, "Primeira Conexão Criada")
    else:
        await award_points(user_id, 100, f"Parceiro Adicional: {partner.name}")
    
    return partner

@api_router.get("/partners/{user_id}", response_model=List[PartnerProfile])
async def get_user_partners(user_id: str):
    partners = await db.partners.find({"user_id": user_id}).to_list(length=None)
    parsed_partners = []
    
    for partner_data in partners:
        if isinstance(partner_data.get('created_at'), str):
            partner_data['created_at'] = datetime.fromisoformat(partner_data['created_at'])
        parsed_partners.append(PartnerProfile(**partner_data))
    
    return parsed_partners

@api_router.get("/partners/limits/{user_id}")
async def get_partner_limits(user_id: str):
    # Get user data
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Count existing partners
    existing_partners_count = await db.partners.count_documents({"user_id": user_id})
    
    # Determine limits based on premium status
    is_premium = user_data.get("is_premium", False)
    max_partners = 4 if is_premium else 1
    
    return {
        "user_id": user_id,
        "is_premium": is_premium,
        "current_partners": existing_partners_count,
        "max_partners": max_partners,
        "can_add_more": existing_partners_count < max_partners,
        "remaining_slots": max(0, max_partners - existing_partners_count)
    }

@api_router.post("/compatibility/enhanced", response_model=EnhancedCompatibilityReport)
async def generate_enhanced_compatibility(user_id: str, partner_id: str):
    # Get user data
    user_data = await db.users.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Get partner data
    partner_data = await db.partners.find_one({"id": partner_id})
    if not partner_data:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    
    # Build user profile
    user_zodiac_data = ZODIAC_DATA[ZodiacSign(user_data["zodiac_sign"])]
    user_profile = {
        "name": user_data["name"],
        "zodiac_sign": user_zodiac_data["name"],
        "temperament": user_zodiac_data["temperament"],
        "element_pt": user_zodiac_data["element_pt"],
        "quality": user_zodiac_data["quality"]
    }
    
    # Build partner profile
    partner_profile = {
        "name": partner_data["name"],
        "zodiac_sign": ZODIAC_DATA[ZodiacSign(partner_data["zodiac_sign"])]["name"],
        "temperament": partner_data["temperament"],
        "element_pt": partner_data["element"],
        "quality": partner_data["quality"]
    }
    
    # Calculate compatibility
    compatibility_report = calculate_enhanced_compatibility(user_profile, partner_profile)
    compatibility_report.user_id = user_id
    compatibility_report.partner_id = partner_id
    
    # Store report
    report_mongo = compatibility_report.dict()
    report_mongo['created_at'] = report_mongo['created_at'].isoformat()
    await db.enhanced_compatibility_reports.insert_one(report_mongo)
    
    # Update user badges
    user_badges = user_data.get('badges', [])
    if 'first_connection_created' not in user_badges:
        user_badges.append('first_connection_created')
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"badges": user_badges}}
        )
    
    # Award points
    await award_points(user_id, 200, "Compatibilidade Avançada Gerada")
    
    return compatibility_report

@api_router.get("/compatibility/enhanced/{user_id}/{partner_id}")
async def get_enhanced_compatibility_report(user_id: str, partner_id: str):
    report_data = await db.enhanced_compatibility_reports.find_one({
        "user_id": user_id,
        "partner_id": partner_id
    })
    
    if not report_data:
        raise HTTPException(status_code=404, detail="Relatório de compatibilidade não encontrado")
    
    if isinstance(report_data.get('created_at'), str):
        report_data['created_at'] = datetime.fromisoformat(report_data['created_at'])
    
    return EnhancedCompatibilityReport(**report_data)

@api_router.get("/temperaments/info")
async def get_temperament_info():
    return {
        "temperaments": TEMPERAMENT_DESCRIPTIONS,
        "zodiac_mapping": {sign.value: data for sign, data in ZODIAC_DATA.items()}
    }

async def award_points(user_id: str, points: int, reason: str):
    """Helper function to award points to user"""
    progress_data = await db.user_progress.find_one({"user_id": user_id})
    
    if not progress_data:
        # Create initial progress
        progress = UserProgress(user_id=user_id, total_points=points)
        progress_mongo = progress.dict()
        progress_mongo['last_activity'] = progress_mongo['last_activity'].isoformat()
        await db.user_progress.insert_one(progress_mongo)
    else:
        # Update progress
        new_total = progress_data.get("total_points", 0) + points
        new_level = (new_total // 500) + 1  # Level up every 500 points
        
        await db.user_progress.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "total_points": new_total,
                    "current_level": new_level,
                    "last_activity": datetime.now(timezone.utc).isoformat()
                },
                "$inc": {"missions_completed": 1}
            }
        )

# Payment Routes
@api_router.post("/payments/checkout/session", response_model=CheckoutSessionResponse)
async def create_checkout_session(request: PremiumUpgradeRequest, http_request: Request):
    try:
        # Get Stripe API key from environment
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        # Initialize Stripe Checkout
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        # Fixed Premium package price - R$ 9.97
        PREMIUM_PACKAGE_PRICE = 9.97
        
        # Build success and cancel URLs from origin_url
        success_url = f"{request.origin_url}/premium/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/dashboard/{request.user_id}"
        
        # Create checkout session request
        checkout_request = CheckoutSessionRequest(
            amount=PREMIUM_PACKAGE_PRICE,
            currency="BRL",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": request.user_id,
                "package": "premium",
                "source": "temperamentos_app"
            }
        )
        
        # Create checkout session
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            user_id=request.user_id,
            amount=PREMIUM_PACKAGE_PRICE,
            currency="BRL",
            session_id=session.session_id,
            payment_status="pending",
            stripe_status="pending",
            metadata=checkout_request.metadata
        )
        
        # Store transaction in database
        transaction_mongo = transaction.dict()
        transaction_mongo['created_at'] = transaction_mongo['created_at'].isoformat()
        transaction_mongo['updated_at'] = transaction_mongo['updated_at'].isoformat()
        await db.payment_transactions.insert_one(transaction_mongo)
        
        return session
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@api_router.get("/payments/checkout/status/{session_id}", response_model=CheckoutStatusResponse)
async def get_checkout_status(session_id: str):
    try:
        # Get Stripe API key from environment
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        # Initialize Stripe Checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Get checkout status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment transaction in database
        transaction_data = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction_data:
            # Update transaction status
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": checkout_status.payment_status,
                        "stripe_status": checkout_status.status,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            # If payment is successful and user hasn't been upgraded yet
            if checkout_status.payment_status == "paid" and not transaction_data.get("processed", False):
                user_id = transaction_data.get("user_id")
                if user_id:
                    # Upgrade user to premium
                    await db.users.update_one(
                        {"id": user_id},
                        {"$set": {"is_premium": True}}
                    )
                    
                    # Mark transaction as processed
                    await db.payment_transactions.update_one(
                        {"session_id": session_id},
                        {"$set": {"processed": True}}
                    )
        
        return checkout_status
        
    except Exception as e:
        logger.error(f"Error getting checkout status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get checkout status")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        # Get Stripe API key from environment
        stripe_api_key = os.environ.get('STRIPE_API_KEY')
        if not stripe_api_key:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        # Initialize Stripe Checkout
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        
        # Get request body and signature
        body = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Handle webhook event
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Process webhook event
        if webhook_response.event_type == "checkout.session.completed":
            session_id = webhook_response.session_id
            
            # Update payment transaction
            transaction_data = await db.payment_transactions.find_one({"session_id": session_id})
            if transaction_data:
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": webhook_response.payment_status,
                            "stripe_status": "completed",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                # Upgrade user to premium if not already processed
                if not transaction_data.get("processed", False):
                    user_id = transaction_data.get("user_id")
                    if user_id:
                        await db.users.update_one(
                            {"id": user_id},
                            {"$set": {"is_premium": True}}
                        )
                        
                        await db.payment_transactions.update_one(
                            {"session_id": session_id},
                            {"$set": {"processed": True}}
                        )
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

# Health check endpoint (without /api prefix)
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

# Health check endpoint (with /api prefix)
@api_router.get("/health")
async def api_health_check():
    return {"status": "ok", "message": "API is running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
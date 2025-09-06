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
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
    badges: List[BadgeType] = []

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

# Premium Content Models
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

# Zodiac Sign Data
ZODIAC_DATA = {
    ZodiacSign.ARIES: {"modality": Modality.CARDINAL, "element": "fire", "name": "Áries"},
    ZodiacSign.TAURUS: {"modality": Modality.FIXED, "element": "earth", "name": "Touro"},
    ZodiacSign.GEMINI: {"modality": Modality.MUTABLE, "element": "air", "name": "Gêmeos"},
    ZodiacSign.CANCER: {"modality": Modality.CARDINAL, "element": "water", "name": "Câncer"},
    ZodiacSign.LEO: {"modality": Modality.FIXED, "element": "fire", "name": "Leão"},
    ZodiacSign.VIRGO: {"modality": Modality.MUTABLE, "element": "earth", "name": "Virgem"},
    ZodiacSign.LIBRA: {"modality": Modality.CARDINAL, "element": "air", "name": "Libra"},
    ZodiacSign.SCORPIO: {"modality": Modality.FIXED, "element": "water", "name": "Escorpião"},
    ZodiacSign.SAGITTARIUS: {"modality": Modality.MUTABLE, "element": "fire", "name": "Sagitário"},
    ZodiacSign.CAPRICORN: {"modality": Modality.CARDINAL, "element": "earth", "name": "Capricórnio"},
    ZodiacSign.AQUARIUS: {"modality": Modality.FIXED, "element": "air", "name": "Aquário"},
    ZodiacSign.PISCES: {"modality": Modality.MUTABLE, "element": "water", "name": "Peixes"}
}

# Detailed Temperament Profiles
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
        growth_tips=["Pratique a paciência e a escuta ativa", "Aprenda a delegar responsabilidades", "Desenvolva persistência em projetos de longo prazo", "Equilibre ação com reflexão"]
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
        growth_tips=["Pratique a flexibilidade em situações menores", "Abra-se para novas experiências", "Aprenda a expressar sentimentos mais abertamente", "Desenvolva tolerância a mudanças"]
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
        growth_tips=["Desenvolva maior assertividade", "Pratique a tomada de decisões firmes", "Aprenda a manter posições importantes", "Equilibre adaptabilidade com consistência"]
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
    # Basic compatibility logic
    sign1_data = ZODIAC_DATA[user1.zodiac_sign]
    sign2_data = ZODIAC_DATA[user2.zodiac_sign]
    
    base_score = 50
    
    # Same modality bonus
    if result1.dominant_modality == result2.dominant_modality:
        base_score += 20
    
    # Element compatibility
    element_compatibility = {
        ("fire", "air"): 15,
        ("fire", "fire"): 10,
        ("earth", "water"): 15,
        ("earth", "earth"): 10,
        ("air", "air"): 10,
        ("water", "water"): 10,
        ("fire", "earth"): 5,
        ("air", "water"): 5,
        ("fire", "water"): -5,
        ("earth", "air"): -5
    }
    
    element_pair = (sign1_data["element"], sign2_data["element"])
    if element_pair in element_compatibility:
        base_score += element_compatibility[element_pair]
    elif (element_pair[1], element_pair[0]) in element_compatibility:
        base_score += element_compatibility[(element_pair[1], element_pair[0])]
    
    base_score = max(1, min(100, base_score))
    
    # Generate insights based on modalities
    strengths = []
    challenges = []
    recommendations = []
    
    if result1.dominant_modality == Modality.CARDINAL and result2.dominant_modality == Modality.CARDINAL:
        strengths.append("Ambos são líderes naturais e iniciadores")
        challenges.append("Pode haver conflito por liderança")
        recommendations.append("Definam áreas de responsabilidade para cada um")
    elif result1.dominant_modality == Modality.FIXED and result2.dominant_modality == Modality.FIXED:
        strengths.append("Relacionamento muito estável e duradouro")
        challenges.append("Dificuldade para se adaptar a mudanças")
        recommendations.append("Pratiquem a flexibilidade em pequenas situações")
    elif result1.dominant_modality == Modality.MUTABLE and result2.dominant_modality == Modality.MUTABLE:
        strengths.append("Grande adaptabilidade e flexibilidade")
        challenges.append("Pode faltar direção e decisão")
        recommendations.append("Estabeleçam metas claras e prazos definidos")
    else:
        strengths.append("Equilíbrio perfeito entre diferentes abordagens")
        recommendations.append("Aproveitem as qualidades complementares de cada um")
    
    premium_insights = [
        "Exercício de comunicação personalizado para seu perfil",
        "Estratégias específicas para lidar com conflitos",
        "Plano de desenvolvimento do relacionamento em 30 dias"
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
        
        # Fixed Premium package price - R$ 12.00
        PREMIUM_PACKAGE_PRICE = 12.00
        
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
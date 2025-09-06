from fastapi import FastAPI, APIRouter, HTTPException
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
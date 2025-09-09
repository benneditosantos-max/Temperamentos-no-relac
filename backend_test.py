import requests
import sys
import json
from datetime import datetime

class TemperamentosAPITester:
    def __init__(self, base_url="https://inspiring-matsumoto.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.user2_id = None
        self.partner_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_create_user(self, name="João Silva", email="joao@exemplo.com", zodiac_sign="leo", birth_date="1990-08-15"):
        """Test user creation"""
        user_data = {
            "name": name,
            "email": email,
            "zodiac_sign": zodiac_sign,
            "birth_date": birth_date
        }
        success, response = self.run_test("Create User", "POST", "users", 200, data=user_data)
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"   Created user ID: {self.user_id}")
            # Verify badges and progress
            if 'badges' in response and 'profile_created' in response['badges']:
                print(f"   ✅ Profile created badge awarded")
            if response.get('progress_percentage') == 25:
                print(f"   ✅ Progress set to 25%")
        return success, response

    def test_create_second_user(self):
        """Create a second user for compatibility testing"""
        user_data = {
            "name": "Maria Santos",
            "email": "maria@exemplo.com", 
            "zodiac_sign": "scorpio",
            "birth_date": "1992-11-05"
        }
        success, response = self.run_test("Create Second User", "POST", "users", 200, data=user_data)
        if success and 'id' in response:
            self.user2_id = response['id']
            print(f"   Created second user ID: {self.user2_id}")
        return success, response

    def test_get_user(self):
        """Test getting user by ID"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        return self.run_test("Get User", "GET", f"users/{self.user_id}", 200)

    def test_get_questionnaire(self):
        """Test getting questionnaire"""
        success, response = self.run_test("Get Questionnaire", "GET", "questionnaire", 200)
        if success and 'questions' in response:
            questions = response['questions']
            print(f"   ✅ Found {len(questions)} questions")
            for i, q in enumerate(questions[:2]):  # Show first 2 questions
                print(f"   Q{i+1}: {q.get('question', 'N/A')[:50]}...")
        return success, response

    def test_submit_questionnaire(self):
        """Test questionnaire submission"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        # Sample answers for all 5 questions (Cardinal dominant)
        answers = [
            {"question_id": 1, "answer": "Ajo rapidamente e lidero a situação", "score": 3},
            {"question_id": 2, "answer": "Gosta de iniciar novos projetos juntos", "score": 3},
            {"question_id": 3, "answer": "Enfrenta de frente e busca resolver rapidamente", "score": 3},
            {"question_id": 4, "answer": "Sou o primeiro a iniciar mudanças", "score": 3},
            {"question_id": 5, "answer": "Naturalmente assume a liderança", "score": 3}
        ]

        submission_data = {
            "user_id": self.user_id,
            "answers": answers
        }

        success, response = self.run_test("Submit Questionnaire", "POST", "questionnaire/submit", 200, data=submission_data)
        if success:
            if 'dominant_modality' in response:
                print(f"   ✅ Dominant modality: {response['dominant_modality']}")
            if 'secondary_modality' in response:
                print(f"   ✅ Secondary modality: {response['secondary_modality']}")
        return success, response

    def test_submit_questionnaire_user2(self):
        """Test questionnaire submission for second user"""
        if not self.user2_id:
            print("❌ No second user ID available for testing")
            return False, {}

        # Sample answers for user 2 (Fixed dominant)
        answers = [
            {"question_id": 1, "answer": "Penso bem e mantenho minha posição", "score": 3},
            {"question_id": 2, "answer": "Valoriza estabilidade e lealdade", "score": 3},
            {"question_id": 3, "answer": "Mantém sua posição com firmeza", "score": 3},
            {"question_id": 4, "answer": "Prefiro estabilidade e resisto a mudanças", "score": 3},
            {"question_id": 5, "answer": "Oferece suporte sólido e constante", "score": 3}
        ]

        submission_data = {
            "user_id": self.user2_id,
            "answers": answers
        }

        return self.run_test("Submit Questionnaire User 2", "POST", "questionnaire/submit", 200, data=submission_data)

    def test_compatibility_report(self):
        """Test compatibility report generation"""
        if not self.user_id or not self.user2_id:
            print("❌ Need both user IDs for compatibility testing")
            return False, {}

        compatibility_data = {
            "user1_id": self.user_id,
            "user2_id": self.user2_id
        }

        success, response = self.run_test("Generate Compatibility Report", "POST", "compatibility", 200, data=compatibility_data)
        if success:
            if 'compatibility_score' in response:
                print(f"   ✅ Compatibility score: {response['compatibility_score']}")
            if 'strengths' in response:
                print(f"   ✅ Strengths: {len(response['strengths'])} items")
            if 'challenges' in response:
                print(f"   ✅ Challenges: {len(response['challenges'])} items")
            if 'recommendations' in response:
                print(f"   ✅ Recommendations: {len(response['recommendations'])} items")
            if 'premium_insights' in response:
                print(f"   ✅ Premium insights: {len(response['premium_insights'])} items")
        return success, response

    def test_upgrade_premium(self):
        """Test premium upgrade"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        return self.run_test("Upgrade Premium", "POST", f"users/{self.user_id}/upgrade-premium", 200)

    def test_share_with_partner(self):
        """Test sharing with partner"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        return self.run_test("Share with Partner", "POST", f"users/{self.user_id}/share", 200)

    def test_zodiac_signs(self):
        """Test getting zodiac signs data"""
        return self.run_test("Get Zodiac Signs", "GET", "zodiac-signs", 200)

    def verify_user_progress_after_questionnaire(self):
        """Verify user progress updated after questionnaire"""
        if not self.user_id:
            return False, {}
        
        success, response = self.run_test("Verify User Progress", "GET", f"users/{self.user_id}", 200)
        if success:
            progress = response.get('progress_percentage', 0)
            badges = response.get('badges', [])
            print(f"   Progress: {progress}%")
            print(f"   Badges: {badges}")
            
            if 'questionnaire_completed' in badges:
                print(f"   ✅ Questionnaire completed badge awarded")
            if progress >= 50:
                print(f"   ✅ Progress updated to {progress}%")
        return success, response

    # ===== PARTNER LIMIT TESTING METHODS =====
    
    def test_partner_limits_free_user_zero_partners(self):
        """Test partner limits for free user with 0 partners"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        
        success, response = self.run_test("Partner Limits - Free User (0 partners)", "GET", f"partners/limits/{self.user_id}", 200)
        if success:
            expected_values = {
                'is_premium': False,
                'current_partners': 0,
                'max_partners': 1,
                'can_add_more': True,
                'remaining_slots': 1
            }
            
            for key, expected in expected_values.items():
                actual = response.get(key)
                if actual == expected:
                    print(f"   ✅ {key}: {actual}")
                else:
                    print(f"   ❌ {key}: expected {expected}, got {actual}")
                    return False, response
        return success, response

    def test_add_first_partner_free_user(self):
        """Test adding first partner to free user (should succeed)"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        partner_data = {
            "name": "Ana Costa",
            "birth_date": "1991-03-15",
            "answers": [
                {"question_id": 1, "answer": "Me adapto conforme as circunstâncias", "score": 3},
                {"question_id": 2, "answer": "Se adapta facilmente às necessidades do parceiro", "score": 3},
                {"question_id": 3, "answer": "Procura um meio-termo e flexibiliza", "score": 3},
                {"question_id": 4, "answer": "Me adapto facilmente a qualquer mudança", "score": 3},
                {"question_id": 5, "answer": "Se adapta ao que o grupo precisa", "score": 3}
            ]
        }

        success, response = self.run_test("Add First Partner - Free User", "POST", f"partners?user_id={self.user_id}", 200, data=partner_data)
        if success:
            if 'id' in response:
                print(f"   ✅ Partner created with ID: {response['id']}")
            if response.get('name') == partner_data['name']:
                print(f"   ✅ Partner name matches: {response['name']}")
            if 'temperament' in response:
                print(f"   ✅ Partner temperament assigned: {response['temperament']}")
        return success, response

    def test_partner_limits_free_user_one_partner(self):
        """Test partner limits for free user with 1 partner"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        
        success, response = self.run_test("Partner Limits - Free User (1 partner)", "GET", f"partners/limits/{self.user_id}", 200)
        if success:
            expected_values = {
                'is_premium': False,
                'current_partners': 1,
                'max_partners': 1,
                'can_add_more': False,
                'remaining_slots': 0
            }
            
            for key, expected in expected_values.items():
                actual = response.get(key)
                if actual == expected:
                    print(f"   ✅ {key}: {actual}")
                else:
                    print(f"   ❌ {key}: expected {expected}, got {actual}")
                    return False, response
        return success, response

    def test_add_second_partner_free_user_should_fail(self):
        """Test adding second partner to free user (should fail)"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        partner_data = {
            "name": "Carlos Silva",
            "birth_date": "1989-07-20",
            "answers": [
                {"question_id": 1, "answer": "Penso bem e mantenho minha posição", "score": 3},
                {"question_id": 2, "answer": "Valoriza estabilidade e lealdade", "score": 3},
                {"question_id": 3, "answer": "Mantém sua posição com firmeza", "score": 3},
                {"question_id": 4, "answer": "Prefiro estabilidade e resisto a mudanças", "score": 3},
                {"question_id": 5, "answer": "Oferece suporte sólido e constante", "score": 3}
            ]
        }

        success, response = self.run_test("Add Second Partner - Free User (Should Fail)", "POST", f"partners?user_id={self.user_id}", 400, data=partner_data)
        if success:
            # For a 400 error, success means we got the expected error
            print(f"   ✅ Correctly blocked second partner for free user")
            if 'detail' in response:
                print(f"   ✅ Error message: {response['detail']}")
        return success, response

    def test_upgrade_user_to_premium(self):
        """Test upgrading user to premium"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        
        return self.run_test("Upgrade User to Premium", "POST", f"users/{self.user_id}/upgrade-premium", 200)

    def test_partner_limits_premium_user_one_partner(self):
        """Test partner limits for premium user with 1 partner"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        
        success, response = self.run_test("Partner Limits - Premium User (1 partner)", "GET", f"partners/limits/{self.user_id}", 200)
        if success:
            expected_values = {
                'is_premium': True,
                'current_partners': 1,
                'max_partners': 4,
                'can_add_more': True,
                'remaining_slots': 3
            }
            
            for key, expected in expected_values.items():
                actual = response.get(key)
                if actual == expected:
                    print(f"   ✅ {key}: {actual}")
                else:
                    print(f"   ❌ {key}: expected {expected}, got {actual}")
                    return False, response
        return success, response

    def test_add_multiple_partners_premium_user(self):
        """Test adding multiple partners to premium user (up to 4 total)"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        partners_data = [
            {
                "name": "Bruno Oliveira",
                "birth_date": "1988-12-10",
                "answers": [
                    {"question_id": 1, "answer": "Ajo rapidamente e lidero a situação", "score": 3},
                    {"question_id": 2, "answer": "Gosta de iniciar novos projetos juntos", "score": 3},
                    {"question_id": 3, "answer": "Enfrenta de frente e busca resolver rapidamente", "score": 3},
                    {"question_id": 4, "answer": "Sou o primeiro a iniciar mudanças", "score": 3},
                    {"question_id": 5, "answer": "Naturalmente assume a liderança", "score": 3}
                ]
            },
            {
                "name": "Diana Santos",
                "birth_date": "1993-05-25",
                "answers": [
                    {"question_id": 1, "answer": "Me adapto conforme as circunstâncias", "score": 3},
                    {"question_id": 2, "answer": "Se adapta facilmente às necessidades do parceiro", "score": 3},
                    {"question_id": 3, "answer": "Procura um meio-termo e flexibiliza", "score": 3},
                    {"question_id": 4, "answer": "Me adapto facilmente a qualquer mudança", "score": 3},
                    {"question_id": 5, "answer": "Se adapta ao que o grupo precisa", "score": 3}
                ]
            },
            {
                "name": "Eduardo Lima",
                "birth_date": "1987-09-08",
                "answers": [
                    {"question_id": 1, "answer": "Penso bem e mantenho minha posição", "score": 3},
                    {"question_id": 2, "answer": "Valoriza estabilidade e lealdade", "score": 3},
                    {"question_id": 3, "answer": "Mantém sua posição com firmeza", "score": 3},
                    {"question_id": 4, "answer": "Prefiro estabilidade e resisto a mudanças", "score": 3},
                    {"question_id": 5, "answer": "Oferece suporte sólido e constante", "score": 3}
                ]
            }
        ]

        success_count = 0
        for i, partner_data in enumerate(partners_data, 2):  # Starting from 2nd partner since we already have 1
            success, response = self.run_test(f"Add Partner {i+1} - Premium User", "POST", f"partners?user_id={self.user_id}", 200, data=partner_data)
            if success:
                success_count += 1
                print(f"   ✅ Partner {i+1} added successfully: {partner_data['name']}")
            else:
                print(f"   ❌ Failed to add partner {i+1}: {partner_data['name']}")
                return False, {}

        return success_count == len(partners_data), {}

    def test_partner_limits_premium_user_four_partners(self):
        """Test partner limits for premium user with 4 partners (max)"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        
        success, response = self.run_test("Partner Limits - Premium User (4 partners)", "GET", f"partners/limits/{self.user_id}", 200)
        if success:
            expected_values = {
                'is_premium': True,
                'current_partners': 4,
                'max_partners': 4,
                'can_add_more': False,
                'remaining_slots': 0
            }
            
            for key, expected in expected_values.items():
                actual = response.get(key)
                if actual == expected:
                    print(f"   ✅ {key}: {actual}")
                else:
                    print(f"   ❌ {key}: expected {expected}, got {actual}")
                    return False, response
        return success, response

    def test_add_fifth_partner_premium_user_should_fail(self):
        """Test adding 5th partner to premium user (should fail)"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        partner_data = {
            "name": "Fernanda Costa",
            "birth_date": "1994-11-30",
            "answers": [
                {"question_id": 1, "answer": "Ajo rapidamente e lidero a situação", "score": 3},
                {"question_id": 2, "answer": "Gosta de iniciar novos projetos juntos", "score": 3},
                {"question_id": 3, "answer": "Enfrenta de frente e busca resolver rapidamente", "score": 3},
                {"question_id": 4, "answer": "Sou o primeiro a iniciar mudanças", "score": 3},
                {"question_id": 5, "answer": "Naturalmente assume a liderança", "score": 3}
            ]
        }

        success, response = self.run_test("Add 5th Partner - Premium User (Should Fail)", "POST", f"partners?user_id={self.user_id}", 400, data=partner_data)
        if success:
            # For a 400 error, success means we got the expected error
            print(f"   ✅ Correctly blocked 5th partner for premium user")
            if 'detail' in response:
                print(f"   ✅ Error message: {response['detail']}")
        return success, response

    def test_get_user_partners(self):
        """Test getting all partners for a user"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}
        
        success, response = self.run_test("Get User Partners", "GET", f"partners/{self.user_id}", 200)
        if success:
            if isinstance(response, list):
                print(f"   ✅ Retrieved {len(response)} partners")
                for i, partner in enumerate(response):
                    if 'name' in partner:
                        print(f"   Partner {i+1}: {partner['name']}")
            else:
                print(f"   ❌ Expected list, got {type(response)}")
                return False, response
        return success, response

    def create_fresh_free_user_for_testing(self):
        """Create a fresh free user for independent testing"""
        user_data = {
            "name": "Teste Gratuito",
            "email": "teste.gratuito@exemplo.com",
            "zodiac_sign": "virgo",
            "birth_date": "1995-09-12"
        }
        success, response = self.run_test("Create Fresh Free User", "POST", "users", 200, data=user_data)
        if success and 'id' in response:
            fresh_user_id = response['id']
            print(f"   Created fresh user ID: {fresh_user_id}")
            return success, fresh_user_id
        return False, None

    def test_fresh_free_user_partner_limits(self):
        """Test partner limits with a completely fresh free user"""
        success, fresh_user_id = self.create_fresh_free_user_for_testing()
        if not success or not fresh_user_id:
            return False, {}

        # Test limits for fresh user (0 partners)
        success, response = self.run_test("Fresh Free User - Partner Limits (0 partners)", "GET", f"partners/limits/{fresh_user_id}", 200)
        if success:
            expected_values = {
                'is_premium': False,
                'current_partners': 0,
                'max_partners': 1,
                'can_add_more': True,
                'remaining_slots': 1
            }
            
            for key, expected in expected_values.items():
                actual = response.get(key)
                if actual == expected:
                    print(f"   ✅ {key}: {actual}")
                else:
                    print(f"   ❌ {key}: expected {expected}, got {actual}")
                    return False, response
        return success, response

    # ===== NEW ADVANCED ENDPOINTS TESTING =====
    
    def test_couple_exercises_list(self):
        """Test GET /api/couple-exercises - List all exercises"""
        success, response = self.run_test("Get Couple Exercises List", "GET", "couple-exercises", 200)
        if success:
            if isinstance(response, list):
                print(f"   ✅ Retrieved {len(response)} exercises")
                for exercise in response[:2]:  # Show first 2
                    if 'title' in exercise:
                        print(f"   Exercise: {exercise['title']}")
            else:
                print(f"   ❌ Expected list, got {type(response)}")
                return False, response
        return success, response

    def test_couple_exercises_specific(self):
        """Test GET /api/couple-exercises/{exercise_type} - Get specific exercise"""
        exercise_types = ["ritual_conexao_diaria", "roleplay_resolucao_conflitos", "mapa_intimidade", "arquitetura_vida_compartilhada"]
        
        for exercise_type in exercise_types:
            success, response = self.run_test(f"Get Exercise - {exercise_type}", "GET", f"couple-exercises/{exercise_type}", 200)
            if success:
                if 'title' in response and 'questions' in response:
                    print(f"   ✅ Exercise '{response['title']}' with {len(response['questions'])} questions")
                else:
                    print(f"   ❌ Missing title or questions in response")
                    return False, response
            else:
                return False, response
        return True, {}

    def test_exercise_responses_save(self):
        """Test POST /api/users/{user_id}/exercise-responses - Save exercise responses"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        response_data = {
            "exercise_type": "ritual_conexao_diaria",
            "question_index": 0,
            "response_text": "Gostaríamos de começar cada dia com um abraço de 30 segundos e compartilhar uma gratidão."
        }

        success, response = self.run_test("Save Exercise Response", "POST", f"users/{self.user_id}/exercise-responses", 200, data=response_data)
        if success:
            if 'id' in response:
                print(f"   ✅ Response saved with ID: {response['id']}")
            if response.get('exercise_type') == response_data['exercise_type']:
                print(f"   ✅ Exercise type matches: {response['exercise_type']}")
        return success, response

    def test_exercise_responses_get(self):
        """Test GET /api/users/{user_id}/exercise-responses/{exercise_type} - Get exercise responses"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        success, response = self.run_test("Get Exercise Responses", "GET", f"users/{self.user_id}/exercise-responses/ritual_conexao_diaria", 200)
        if success:
            if isinstance(response, list):
                print(f"   ✅ Retrieved {len(response)} responses")
                if len(response) > 0 and 'response_text' in response[0]:
                    print(f"   ✅ First response: {response[0]['response_text'][:50]}...")
            else:
                print(f"   ❌ Expected list, got {type(response)}")
                return False, response
        return success, response

    def test_complete_exercise(self):
        """Test POST /api/users/{user_id}/complete-exercise/{exercise_type} - Mark exercise as completed"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        success, response = self.run_test("Complete Exercise", "POST", f"users/{self.user_id}/complete-exercise/ritual_conexao_diaria", 200)
        if success:
            if 'completed' in response and response['completed']:
                print(f"   ✅ Exercise marked as completed")
            if 'exercise_type' in response:
                print(f"   ✅ Exercise type: {response['exercise_type']}")
        return success, response

    def test_exercise_completions_list(self):
        """Test GET /api/users/{user_id}/exercise-completions - List completed exercises"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        success, response = self.run_test("Get Exercise Completions", "GET", f"users/{self.user_id}/exercise-completions", 200)
        if success:
            if isinstance(response, list):
                print(f"   ✅ Retrieved {len(response)} completed exercises")
                for completion in response:
                    if 'exercise_type' in completion:
                        print(f"   Completed: {completion['exercise_type']}")
            else:
                print(f"   ❌ Expected list, got {type(response)}")
                return False, response
        return success, response

    def test_temperament_questionnaire_get(self):
        """Test GET /api/temperament-questionnaire - Get enhanced 6-question questionnaire"""
        success, response = self.run_test("Get Temperament Questionnaire", "GET", "temperament-questionnaire", 200)
        if success:
            if 'questions' in response:
                questions = response['questions']
                print(f"   ✅ Found {len(questions)} questions")
                if len(questions) == 6:
                    print(f"   ✅ Correct number of questions (6)")
                else:
                    print(f"   ❌ Expected 6 questions, got {len(questions)}")
                    return False, response
                
                # Check first question structure
                if len(questions) > 0:
                    q1 = questions[0]
                    if 'question' in q1 and 'options' in q1:
                        print(f"   ✅ Question structure valid")
                        if len(q1['options']) == 4:
                            print(f"   ✅ Each question has 4 options")
                        else:
                            print(f"   ❌ Expected 4 options per question, got {len(q1['options'])}")
                    else:
                        print(f"   ❌ Missing question or options in question structure")
                        return False, response
            else:
                print(f"   ❌ Missing questions in response")
                return False, response
        return success, response

    def test_temperament_questionnaire_submit(self):
        """Test POST /api/users/{user_id}/temperament-questionnaire - Submit temperament questionnaire"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        # Sample answers for 6-question temperament questionnaire
        answers = [
            {"question_id": 1, "selected_option": "Tomo decisões rapidamente e assumo a liderança"},
            {"question_id": 2, "selected_option": "Sou direto e assertivo na comunicação"},
            {"question_id": 3, "selected_option": "Enfrento conflitos de frente e busco soluções imediatas"},
            {"question_id": 4, "selected_option": "Sou apaixonado e intenso na intimidade"},
            {"question_id": 5, "selected_option": "Tomo decisões baseadas na intuição e urgência"},
            {"question_id": 6, "selected_option": "Demonstro amor através de gestos grandiosos e iniciativas"}
        ]

        submission_data = {"answers": answers}

        success, response = self.run_test("Submit Temperament Questionnaire", "POST", f"users/{self.user_id}/temperament-questionnaire", 200, data=submission_data)
        if success:
            if 'dominant_temperament' in response:
                print(f"   ✅ Dominant temperament: {response['dominant_temperament']}")
            if 'temperament_scores' in response:
                scores = response['temperament_scores']
                print(f"   ✅ Temperament scores: {scores}")
            if 'temperament_percentage' in response:
                print(f"   ✅ Temperament percentage: {response['temperament_percentage']}%")
        return success, response

    def test_temperament_results_get(self):
        """Test GET /api/users/{user_id}/temperament-results - Get temperament results"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        success, response = self.run_test("Get Temperament Results", "GET", f"users/{self.user_id}/temperament-results", 200)
        if success:
            if 'dominant_temperament' in response:
                print(f"   ✅ Dominant temperament: {response['dominant_temperament']}")
            if 'temperament_scores' in response:
                print(f"   ✅ Temperament scores available")
            if 'questions_answers' in response:
                print(f"   ✅ Questions and answers stored")
        return success, response

    def test_advanced_compatibility_generate(self):
        """Test POST /api/users/{user_id}/advanced-compatibility - Generate complete compatibility report"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        compatibility_data = {
            "partner_name": "Isabella Rodriguez",
            "partner_temperament": "sanguineo",
            "user_responses": ["cardinal", "assertivo", "direto", "apaixonado", "intuitivo", "grandioso"],
            "partner_responses": ["mutavel", "empático", "flexível", "adaptável", "considerado", "atencioso"]
        }

        success, response = self.run_test("Generate Advanced Compatibility", "POST", f"users/{self.user_id}/advanced-compatibility", 200, data=compatibility_data)
        if success:
            if 'overall_score' in response:
                print(f"   ✅ Overall compatibility score: {response['overall_score']}")
            if 'temperament_compatibility' in response:
                print(f"   ✅ Temperament compatibility: {response['temperament_compatibility']}")
            if 'intimacy_compatibility' in response:
                print(f"   ✅ Intimacy compatibility: {response['intimacy_compatibility']}")
            if 'conflict_resolution_compatibility' in response:
                print(f"   ✅ Conflict resolution compatibility: {response['conflict_resolution_compatibility']}")
            if 'strengths' in response and 'challenges' in response:
                print(f"   ✅ Strengths: {len(response['strengths'])}, Challenges: {len(response['challenges'])}")
            if 'action_plan' in response:
                print(f"   ✅ Action plan: {len(response['action_plan'])} items")
        return success, response

    def test_advanced_compatibility_preview(self):
        """Test GET /api/users/{user_id}/advanced-compatibility-preview - Get preview for free users"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        success, response = self.run_test("Get Advanced Compatibility Preview", "GET", f"users/{self.user_id}/advanced-compatibility-preview", 200)
        if success:
            if 'preview_score' in response:
                print(f"   ✅ Preview score: {response['preview_score']}")
            if 'preview_insights' in response:
                print(f"   ✅ Preview insights: {len(response['preview_insights'])} items")
            if 'upgrade_message' in response:
                print(f"   ✅ Upgrade message present")
        return success, response

    def test_detailed_temperament_profile(self):
        """Test GET /api/users/{user_id}/detailed-temperament-profile - Get detailed premium profile"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        success, response = self.run_test("Get Detailed Temperament Profile", "GET", f"users/{self.user_id}/detailed-temperament-profile", 200)
        if success:
            if 'dominant_temperament' in response:
                print(f"   ✅ Dominant temperament: {response['dominant_temperament']}")
            if 'temperament_percentages' in response:
                print(f"   ✅ Temperament percentages available")
            if 'deep_insights' in response:
                print(f"   ✅ Deep insights: {len(response['deep_insights'])} items")
            if 'relationship_patterns' in response:
                print(f"   ✅ Relationship patterns: {len(response['relationship_patterns'])} items")
            if 'communication_style' in response:
                print(f"   ✅ Communication style analysis available")
            if 'growth_recommendations' in response:
                print(f"   ✅ Growth recommendations: {len(response['growth_recommendations'])} items")
        return success, response

    def test_badges_system_after_exercises(self):
        """Test that badges are properly awarded after completing exercises"""
        if not self.user_id:
            print("❌ No user ID available for testing")
            return False, {}

        success, response = self.run_test("Check Badges After Exercises", "GET", f"users/{self.user_id}", 200)
        if success:
            badges = response.get('badges', [])
            print(f"   Current badges: {badges}")
            
            expected_badges = ['profile_created', 'questionnaire_completed']
            if 'couple_exercise_completed' in badges:
                expected_badges.append('couple_exercise_completed')
            if 'advanced_compatibility_generated' in badges:
                expected_badges.append('advanced_compatibility_generated')
                
            for badge in expected_badges:
                if badge in badges:
                    print(f"   ✅ Badge '{badge}' correctly awarded")
                else:
                    print(f"   ❌ Badge '{badge}' missing")
        return success, response

    def create_premium_user_for_testing(self):
        """Create a premium user for testing premium features"""
        user_data = {
            "name": "Premium Tester",
            "email": "premium@exemplo.com",
            "zodiac_sign": "aries",
            "birth_date": "1985-04-10"
        }
        success, response = self.run_test("Create Premium User", "POST", "users", 200, data=user_data)
        if success and 'id' in response:
            premium_user_id = response['id']
            print(f"   Created premium user ID: {premium_user_id}")
            
            # Upgrade to premium
            upgrade_success, _ = self.run_test("Upgrade to Premium", "POST", f"users/{premium_user_id}/upgrade-premium", 200)
            if upgrade_success:
                print(f"   ✅ User upgraded to premium")
                return True, premium_user_id
        return False, None

    def test_premium_vs_free_differentiation(self):
        """Test that premium features are properly differentiated from free features"""
        # Create premium user
        success, premium_user_id = self.create_premium_user_for_testing()
        if not success:
            return False, {}

        # Test detailed profile for premium user
        success, premium_response = self.run_test("Premium - Detailed Profile", "GET", f"users/{premium_user_id}/detailed-temperament-profile", 200)
        
        # Test detailed profile for free user (should have limited access)
        if self.user_id:
            success_free, free_response = self.run_test("Free - Detailed Profile (Limited)", "GET", f"users/{self.user_id}/detailed-temperament-profile", 200)
            
            if success and success_free:
                # Compare responses
                premium_insights = len(premium_response.get('deep_insights', []))
                free_insights = len(free_response.get('deep_insights', []))
                
                print(f"   Premium insights: {premium_insights}")
                print(f"   Free insights: {free_insights}")
                
                if premium_insights >= free_insights:
                    print(f"   ✅ Premium users get more detailed insights")
                else:
                    print(f"   ❌ Premium differentiation not working properly")
                    return False, {}
        
        return success, premium_response

def main():
    print("🚀 Starting Temperamentos no Relacionamento API Tests - ADVANCED ENDPOINTS")
    print("=" * 80)
    
    tester = TemperamentosAPITester()
    
    # Test sequence - Basic functionality first
    basic_tests = [
        ("Root API", tester.test_root_endpoint),
        ("Create User", tester.test_create_user),
        ("Get User", tester.test_get_user),
        ("Get Questionnaire", tester.test_get_questionnaire),
        ("Submit Questionnaire", tester.test_submit_questionnaire),
        ("Verify Progress After Questionnaire", tester.verify_user_progress_after_questionnaire),
        ("Get Zodiac Signs", tester.test_zodiac_signs)
    ]
    
    # NEW ADVANCED ENDPOINTS TESTS - Main focus of this testing session
    advanced_endpoints_tests = [
        ("🔥 Couple Exercises - List All", tester.test_couple_exercises_list),
        ("🔥 Couple Exercises - Specific Types", tester.test_couple_exercises_specific),
        ("🔥 Exercise Responses - Save", tester.test_exercise_responses_save),
        ("🔥 Exercise Responses - Get", tester.test_exercise_responses_get),
        ("🔥 Complete Exercise", tester.test_complete_exercise),
        ("🔥 Exercise Completions - List", tester.test_exercise_completions_list),
        ("🔥 Temperament Questionnaire - Get (6 questions)", tester.test_temperament_questionnaire_get),
        ("🔥 Temperament Questionnaire - Submit", tester.test_temperament_questionnaire_submit),
        ("🔥 Temperament Results - Get", tester.test_temperament_results_get),
        ("🔥 Advanced Compatibility - Generate", tester.test_advanced_compatibility_generate),
        ("🔥 Advanced Compatibility - Preview (Free)", tester.test_advanced_compatibility_preview),
        ("🔥 Detailed Temperament Profile - Premium", tester.test_detailed_temperament_profile),
        ("🔥 Badges System - After Exercises", tester.test_badges_system_after_exercises),
        ("🔥 Premium vs Free - Differentiation", tester.test_premium_vs_free_differentiation)
    ]
    
    # Partner Limit Tests - Previously tested functionality
    partner_limit_tests = [
        ("Partner Limits - Free User (0 partners)", tester.test_partner_limits_free_user_zero_partners),
        ("Add First Partner - Free User", tester.test_add_first_partner_free_user),
        ("Partner Limits - Free User (1 partner)", tester.test_partner_limits_free_user_one_partner),
        ("Add Second Partner - Free User (Should Fail)", tester.test_add_second_partner_free_user_should_fail),
        ("Upgrade User to Premium", tester.test_upgrade_user_to_premium),
        ("Partner Limits - Premium User (1 partner)", tester.test_partner_limits_premium_user_one_partner),
        ("Add Multiple Partners - Premium User", tester.test_add_multiple_partners_premium_user),
        ("Partner Limits - Premium User (4 partners)", tester.test_partner_limits_premium_user_four_partners),
        ("Add 5th Partner - Premium User (Should Fail)", tester.test_add_fifth_partner_premium_user_should_fail),
        ("Get User Partners", tester.test_get_user_partners),
        ("Fresh Free User - Partner Limits Test", tester.test_fresh_free_user_partner_limits)
    ]
    
    # Additional tests
    additional_tests = [
        ("Create Second User", tester.test_create_second_user),
        ("Submit Questionnaire User 2", tester.test_submit_questionnaire_user2),
        ("Generate Compatibility Report", tester.test_compatibility_report),
        ("Share with Partner", tester.test_share_with_partner)
    ]
    
    # Combine all tests - Focus on advanced endpoints first
    tests = basic_tests + advanced_endpoints_tests + partner_limit_tests + additional_tests
    
    failed_tests = []
    
    print(f"\n🎯 PRIORITY: Testing {len(advanced_endpoints_tests)} NEW ADVANCED ENDPOINTS")
    print("=" * 80)
    
    for test_name, test_func in tests:
        try:
            success, _ = test_func()
            if not success:
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 80)
    print(f"📊 ADVANCED ENDPOINTS TEST RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Separate advanced endpoint results
    advanced_failed = [test for test in failed_tests if "🔥" in test]
    other_failed = [test for test in failed_tests if "🔥" not in test]
    
    if advanced_failed:
        print(f"\n❌ FAILED ADVANCED ENDPOINTS ({len(advanced_failed)}):")
        for test in advanced_failed:
            print(f"   - {test}")
    
    if other_failed:
        print(f"\n❌ Other failed tests ({len(other_failed)}):")
        for test in other_failed:
            print(f"   - {test}")
    
    if not failed_tests:
        print(f"\n🎉 ALL TESTS PASSED! All advanced endpoints working correctly!")
    elif not advanced_failed:
        print(f"\n✅ ALL ADVANCED ENDPOINTS WORKING! {len(other_failed)} other issues found.")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
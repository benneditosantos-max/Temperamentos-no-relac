import requests
import sys
import json
from datetime import datetime

class TemperamentosAPITester:
    def __init__(self, base_url="https://amor-temperamentos.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.user2_id = None

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

def main():
    print("🚀 Starting Temperamentos no Relacionamento API Tests")
    print("=" * 60)
    
    tester = TemperamentosAPITester()
    
    # Test sequence
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("Create User", tester.test_create_user),
        ("Get User", tester.test_get_user),
        ("Get Questionnaire", tester.test_get_questionnaire),
        ("Submit Questionnaire", tester.test_submit_questionnaire),
        ("Verify Progress After Questionnaire", tester.verify_user_progress_after_questionnaire),
        ("Create Second User", tester.test_create_second_user),
        ("Submit Questionnaire User 2", tester.test_submit_questionnaire_user2),
        ("Generate Compatibility Report", tester.test_compatibility_report),
        ("Upgrade Premium", tester.test_upgrade_premium),
        ("Share with Partner", tester.test_share_with_partner),
        ("Get Zodiac Signs", tester.test_zodiac_signs)
    ]
    
    failed_tests = []
    
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
    print("\n" + "=" * 60)
    print(f"📊 TEST RESULTS")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests:")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print(f"\n🎉 All tests passed!")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
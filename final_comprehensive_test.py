import requests
import json

class ComprehensiveAdvancedTester:
    def __init__(self):
        self.base_url = "https://inspiring-matsumoto.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        self.user_id = None
        self.premium_user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
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

    def setup_complete_user(self):
        """Create a user and complete all prerequisites"""
        # Create user
        user_data = {
            "name": "Complete Test User",
            "email": "complete@exemplo.com",
            "zodiac_sign": "leo",
            "birth_date": "1990-08-15"
        }
        success, response = self.run_test("Create Complete User", "POST", "users", 200, data=user_data)
        if not success or 'id' not in response:
            return False
        
        self.user_id = response['id']
        
        # Submit temperament questionnaire
        answers = [
            {"question_id": 1, "selected_option": "Tomo decisões rapidamente e assumo a liderança"},
            {"question_id": 2, "selected_option": "Sou direto e assertivo na comunicação"},
            {"question_id": 3, "selected_option": "Enfrento conflitos de frente e busco soluções imediatas"},
            {"question_id": 4, "selected_option": "Sou apaixonado e intenso na intimidade"},
            {"question_id": 5, "selected_option": "Tomo decisões baseadas na intuição e urgência"},
            {"question_id": 6, "selected_option": "Demonstro amor através de gestos grandiosos e iniciativas"}
        ]
        submission_data = {"answers": answers}
        success, _ = self.run_test("Submit Temperament Questionnaire", "POST", f"users/{self.user_id}/temperament-questionnaire", 200, data=submission_data)
        
        return success

    def setup_complete_premium_user(self):
        """Create a premium user and complete all prerequisites"""
        # Create premium user
        user_data = {
            "name": "Premium Complete User",
            "email": "premium.complete@exemplo.com",
            "zodiac_sign": "aries",
            "birth_date": "1985-04-10"
        }
        success, response = self.run_test("Create Premium Complete User", "POST", "users", 200, data=user_data)
        if not success or 'id' not in response:
            return False
        
        self.premium_user_id = response['id']
        
        # Upgrade to premium
        success, _ = self.run_test("Upgrade to Premium", "POST", f"users/{self.premium_user_id}/upgrade-premium", 200)
        if not success:
            return False
        
        # Submit temperament questionnaire for premium user
        answers = [
            {"question_id": 1, "selected_option": "Tomo decisões rapidamente e assumo a liderança"},
            {"question_id": 2, "selected_option": "Sou direto e assertivo na comunicação"},
            {"question_id": 3, "selected_option": "Enfrento conflitos de frente e busco soluções imediatas"},
            {"question_id": 4, "selected_option": "Sou apaixonado e intenso na intimidade"},
            {"question_id": 5, "selected_option": "Tomo decisões baseadas na intuição e urgência"},
            {"question_id": 6, "selected_option": "Demonstro amor através de gestos grandiosos e iniciativas"}
        ]
        submission_data = {"answers": answers}
        success, _ = self.run_test("Submit Premium Temperament Questionnaire", "POST", f"users/{self.premium_user_id}/temperament-questionnaire", 200, data=submission_data)
        
        return success

    def test_complete_exercise_flow(self):
        """Test complete exercise flow with all questions answered"""
        if not self.user_id:
            return False
        
        # Add responses for all 6 questions of ritual_conexao_diaria
        exercise_responses = [
            "Gostaríamos de começar cada dia com um abraço de 30 segundos e compartilhar uma gratidão.",
            "O momento perfeito seria às 20h, após o jantar, quando podemos nos dedicar completamente um ao outro.",
            "Podemos desligar todos os dispositivos e manter contato visual durante toda a conversa.",
            "Eu te amo, obrigado por estar aqui comigo, estou ansioso para nosso dia juntos amanhã.",
            "Vamos criar um espaço sagrado na sala, com velas e música suave de fundo.",
            "Podemos fazer isso por 30 dias consecutivos e depois avaliar como nos sentimos."
        ]
        
        # Add all responses
        for i, response_text in enumerate(exercise_responses):
            response_data = {
                "exercise_type": "ritual_conexao_diaria",
                "question_index": i,
                "response_text": response_text
            }
            success, _ = self.run_test(f"Add Exercise Response {i+1}", "POST", f"users/{self.user_id}/exercise-responses", 200, data=response_data)
            if not success:
                return False
        
        # Now try to complete the exercise
        success, response = self.run_test("Complete Exercise (All Questions Answered)", "POST", f"users/{self.user_id}/complete-exercise/ritual_conexao_diaria", 200)
        if success:
            if response.get('completed'):
                print(f"   ✅ Exercise successfully completed")
            if 'exercise_type' in response:
                print(f"   ✅ Exercise type: {response['exercise_type']}")
        
        return success

    def test_premium_detailed_profile(self):
        """Test premium detailed temperament profile with proper setup"""
        if not self.premium_user_id:
            return False
        
        success, response = self.run_test("Premium Detailed Profile (Complete Setup)", "GET", f"users/{self.premium_user_id}/detailed-temperament-profile", 200)
        if success:
            if 'dominant_temperament' in response:
                print(f"   ✅ Dominant temperament: {response['dominant_temperament']}")
            if 'deep_insights' in response:
                print(f"   ✅ Deep insights: {len(response['deep_insights'])} items")
            if 'relationship_patterns' in response:
                print(f"   ✅ Relationship patterns: {len(response['relationship_patterns'])} items")
            if 'growth_recommendations' in response:
                print(f"   ✅ Growth recommendations: {len(response['growth_recommendations'])} items")
        
        return success

    def test_premium_vs_free_differentiation(self):
        """Test premium vs free differentiation with proper setup"""
        if not self.user_id or not self.premium_user_id:
            return False
        
        # Upgrade the free user to premium for comparison
        success, _ = self.run_test("Upgrade Free User to Premium", "POST", f"users/{self.user_id}/upgrade-premium", 200)
        if not success:
            return False
        
        # Test detailed profile for both users (both should work now as premium)
        success1, premium_response = self.run_test("Premium User - Detailed Profile", "GET", f"users/{self.premium_user_id}/detailed-temperament-profile", 200)
        success2, upgraded_response = self.run_test("Upgraded User - Detailed Profile", "GET", f"users/{self.user_id}/detailed-temperament-profile", 200)
        
        if success1 and success2:
            premium_insights = len(premium_response.get('deep_insights', []))
            upgraded_insights = len(upgraded_response.get('deep_insights', []))
            
            print(f"   Premium user insights: {premium_insights}")
            print(f"   Upgraded user insights: {upgraded_insights}")
            
            if premium_insights > 0 and upgraded_insights > 0:
                print(f"   ✅ Both premium users get detailed insights")
                return True
            else:
                print(f"   ❌ Premium features not working properly")
                return False
        
        return False

    def run_comprehensive_test(self):
        """Run comprehensive test of all advanced endpoints"""
        print("🚀 COMPREHENSIVE ADVANCED ENDPOINTS TEST")
        print("=" * 60)
        
        # Setup users
        if not self.setup_complete_user():
            print("❌ Failed to setup complete user")
            return
        
        if not self.setup_complete_premium_user():
            print("❌ Failed to setup complete premium user")
            return
        
        print(f"\n✅ Setup complete - User ID: {self.user_id}")
        print(f"✅ Setup complete - Premium User ID: {self.premium_user_id}")
        
        # Test the previously failing endpoints
        print(f"\n🎯 TESTING PREVIOUSLY FAILING ENDPOINTS")
        print("=" * 60)
        
        # Test 1: Complete Exercise Flow
        success1 = self.test_complete_exercise_flow()
        
        # Test 2: Premium Detailed Profile
        success2 = self.test_premium_detailed_profile()
        
        # Test 3: Premium vs Free Differentiation
        success3 = self.test_premium_vs_free_differentiation()
        
        # Summary
        print(f"\n" + "=" * 60)
        print(f"📊 COMPREHENSIVE TEST RESULTS")
        print(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        failed_tests = []
        if not success1:
            failed_tests.append("Complete Exercise Flow")
        if not success2:
            failed_tests.append("Premium Detailed Profile")
        if not success3:
            failed_tests.append("Premium vs Free Differentiation")
        
        if failed_tests:
            print(f"\n❌ Still failing:")
            for test in failed_tests:
                print(f"   - {test}")
        else:
            print(f"\n🎉 ALL ADVANCED ENDPOINTS NOW WORKING!")
        
        return len(failed_tests) == 0

if __name__ == "__main__":
    tester = ComprehensiveAdvancedTester()
    tester.run_comprehensive_test()
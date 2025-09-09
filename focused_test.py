import requests
import json

class FocusedTester:
    def __init__(self):
        self.base_url = "https://inspiring-matsumoto.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        self.user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
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

    def setup_user(self):
        """Create a user for testing"""
        user_data = {
            "name": "Test User",
            "email": "test@exemplo.com",
            "zodiac_sign": "leo",
            "birth_date": "1990-08-15"
        }
        success, response = self.run_test("Create Test User", "POST", "users", 200, data=user_data)
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"   Created user ID: {self.user_id}")
            return True
        return False

    def test_fixed_endpoints(self):
        """Test the endpoints that were just fixed"""
        if not self.setup_user():
            print("❌ Failed to create user")
            return
        
        # Test couple exercises list (should now return list)
        success, response = self.run_test("Couple Exercises List (Fixed)", "GET", "couple-exercises", 200)
        if success:
            if isinstance(response, list):
                print(f"   ✅ Now returns list with {len(response)} exercises")
            else:
                print(f"   ❌ Still returns {type(response)}")

        # Add an exercise response first
        response_data = {
            "exercise_type": "ritual_conexao_diaria",
            "question_index": 0,
            "response_text": "Test response for ritual"
        }
        self.run_test("Add Exercise Response", "POST", f"users/{self.user_id}/exercise-responses", 200, data=response_data)

        # Test exercise responses get (should now work)
        success, response = self.run_test("Get Exercise Responses (Fixed)", "GET", f"users/{self.user_id}/exercise-responses/ritual_conexao_diaria", 200)
        if success:
            if isinstance(response, list):
                print(f"   ✅ Now returns list with {len(response)} responses")
            else:
                print(f"   ❌ Still returns {type(response)}")

        # Test exercise completions (should now return list)
        success, response = self.run_test("Get Exercise Completions (Fixed)", "GET", f"users/{self.user_id}/exercise-completions", 200)
        if success:
            if isinstance(response, list):
                print(f"   ✅ Now returns list with {len(response)} completions")
            else:
                print(f"   ❌ Still returns {type(response)}")

        # Submit temperament questionnaire first
        answers = [
            {"question_id": 1, "selected_option": "Tomo decisões rapidamente e assumo a liderança"},
            {"question_id": 2, "selected_option": "Sou direto e assertivo na comunicação"},
            {"question_id": 3, "selected_option": "Enfrento conflitos de frente e busco soluções imediatas"},
            {"question_id": 4, "selected_option": "Sou apaixonado e intenso na intimidade"},
            {"question_id": 5, "selected_option": "Tomo decisões baseadas na intuição e urgência"},
            {"question_id": 6, "selected_option": "Demonstro amor através de gestos grandiosos e iniciativas"}
        ]
        submission_data = {"answers": answers}
        self.run_test("Submit Temperament Questionnaire", "POST", f"users/{self.user_id}/temperament-questionnaire", 200, data=submission_data)

        # Test temperament results (should now work)
        success, response = self.run_test("Get Temperament Results (Fixed)", "GET", f"users/{self.user_id}/temperament-results", 200)
        if success:
            if 'dominant_temperament' in response:
                print(f"   ✅ Results available with temperament: {response['dominant_temperament']}")
            else:
                print(f"   ❌ Missing temperament data")

if __name__ == "__main__":
    print("🔧 Testing Fixed Endpoints")
    print("=" * 50)
    
    tester = FocusedTester()
    tester.test_fixed_endpoints()
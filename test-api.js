// Simple API test script
// Run with: node test-api.js (make sure server is running on port 3000)

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Airbnb API...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Host',
        email: `test-${Date.now()}@example.com`,
        username: `testhost${Date.now()}`,
        phone: '+1234567890',
        password: 'password123',
        role: 'HOST'
      })
    });
    
    if (registerResponse.ok) {
      const user = await registerResponse.json();
      console.log('✅ Registration successful:', user.name);
    } else {
      console.log('❌ Registration failed:', await registerResponse.text());
    }

    // Test 2: Login
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    let token = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('✅ Login successful, token received');
    } else {
      console.log('❌ Login failed (expected if user doesn\'t exist)');
    }

    // Test 3: Get listings (public endpoint)
    console.log('\n3. Testing get listings...');
    const listingsResponse = await fetch(`${BASE_URL}/listings`);
    if (listingsResponse.ok) {
      const listings = await listingsResponse.json();
      console.log(`✅ Retrieved ${listings.length} listings`);
    } else {
      console.log('❌ Failed to get listings');
    }

    // Test 4: Test protected endpoint without token
    console.log('\n4. Testing protected endpoint without token...');
    const protectedResponse = await fetch(`${BASE_URL}/auth/me`);
    if (protectedResponse.status === 401) {
      console.log('✅ Protected endpoint correctly rejected unauthorized request');
    } else {
      console.log('❌ Protected endpoint should return 401');
    }

    // Test 5: Test with token (if we have one)
    if (token) {
      console.log('\n5. Testing protected endpoint with token...');
      const meResponse = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (meResponse.ok) {
        const userData = await meResponse.json();
        console.log('✅ Protected endpoint accessible with token:', userData.name);
      } else {
        console.log('❌ Protected endpoint failed with token');
      }
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ or install node-fetch');
  process.exit(1);
}

testAPI();
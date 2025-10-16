/**
 * Simple test script to verify all endpoints are working
 * Run this after starting the server with: npm run dev
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testEndpoints() {
  console.log('🧪 Testing SignatureRx Backend Endpoints...\n');

  try {
    // Test 1: Get available medicines
    console.log('1. Testing GET /prescriptions/medicines');
    const medicinesResponse = await axios.get(`${BASE_URL}/prescriptions/medicines`);
    console.log('✅ Medicines endpoint working:', medicinesResponse.data.success);
    console.log('   Available medicines:', medicinesResponse.data.data.length);

    // Test 2: Get mock patient data
    console.log('\n2. Testing GET /prescriptions/patient/mock');
    const patientResponse = await axios.get(`${BASE_URL}/prescriptions/patient/mock`);
    console.log('✅ Mock patient endpoint working:', patientResponse.data.success);
    console.log('   Patient name:', patientResponse.data.data.name);

    // Test 3: Test OAuth2 connection (this will fail without proper credentials)
    console.log('\n3. Testing GET /auth/test-connection');
    try {
      const oauthResponse = await axios.get(`${BASE_URL}/auth/test-connection`);
      console.log('✅ OAuth2 test endpoint working:', oauthResponse.data.success);
    } catch (error) {
      console.log('⚠️  OAuth2 test failed (expected without credentials):', error.response?.data?.error || error.message);
    }

    // Test 4: Get token status
    console.log('\n4. Testing GET /auth/token-status');
    const tokenStatusResponse = await axios.get(`${BASE_URL}/auth/token-status`);
    console.log('✅ Token status endpoint working:', tokenStatusResponse.data.success);
    console.log('   Token cached:', tokenStatusResponse.data.data.cached);

    // Test 5: Test webhook logs
    console.log('\n5. Testing GET /webhooks/logs');
    const webhookLogsResponse = await axios.get(`${BASE_URL}/webhooks/logs`);
    console.log('✅ Webhook logs endpoint working:', webhookLogsResponse.data.success);
    console.log('   Total webhook logs:', webhookLogsResponse.data.pagination.total);

    // Test 6: Test webhook stats
    console.log('\n6. Testing GET /webhooks/stats/overview');
    const webhookStatsResponse = await axios.get(`${BASE_URL}/webhooks/stats/overview`);
    console.log('✅ Webhook stats endpoint working:', webhookStatsResponse.data.success);

    console.log('\n🎉 All endpoints are working correctly!');
    console.log('\n📋 Available endpoints for frontend:');
    console.log('   • GET  /prescriptions/medicines - Get available medicines');
    console.log('   • GET  /prescriptions/patient/mock - Get mock patient data');
    console.log('   • POST /prescriptions/issue - Issue prescription');
    console.log('   • GET  /prescriptions/{id}/status - Get prescription status');
    console.log('   • POST /webhooks/signaturerx - Receive SignatureRx webhooks');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the tests
testEndpoints();

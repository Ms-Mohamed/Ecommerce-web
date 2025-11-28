// Test script to simulate frontend inventory API calls
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testInventoryFrontend() {
  try {
    console.log('🧪 Testing inventory API from frontend perspective...\n');

    // Test 1: Basic inventory fetch (should return 401 without auth)
    console.log('Test 1: Basic inventory fetch');
    try {
      const response = await fetch('http://localhost:3000/api/inventory');
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, data);
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Test 2: Low stock filter
    console.log('\nTest 2: Low stock filter');
    try {
      const response = await fetch('http://localhost:3000/api/inventory?lowStock=true');
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, data);
    } catch (error) {
      console.log('Error:', error.message);
    }

    // Test 3: Category filter
    console.log('\nTest 3: Category filter');
    try {
      const response = await fetch('http://localhost:3000/api/inventory?category=Phones');
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, data);
    } catch (error) {
      console.log('Error:', error.message);
    }

    console.log('\n✅ Frontend inventory API tests completed!');
    console.log('Note: 401 errors are expected without proper authentication');

  } catch (error) {
    console.error('❌ Error testing frontend inventory API:', error);
  }
}

testInventoryFrontend();

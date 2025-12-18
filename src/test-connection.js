// Test connection ke backend
async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    const response = await fetch('http://localhost:3005/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Response text:', text);
    
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Error type:', error.constructor.name);
  }
}

// Run test
testConnection();
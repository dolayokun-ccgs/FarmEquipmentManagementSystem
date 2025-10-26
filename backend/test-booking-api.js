const fetch = require('node-fetch');

async function testBookingAPI() {
  const baseURL = 'http://localhost:5000/api';

  // Test with farmer user who has bookings
  const loginData = {
    email: 'oluwaseun.adeyemi@farmer.ng',
    password: 'Farmer123!@#'
  };

  try {
    // Login first
    console.log('Logging in as farmer...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginRes.json();

    if (!loginResult.data || !loginResult.data.accessToken) {
      console.log('Login failed:', loginResult);
      process.exit(1);
    }

    const token = loginResult.data.accessToken;
    console.log('Login successful! Token:', token.substring(0, 20) + '...');
    console.log('User role:', loginResult.data.user.role);
    console.log('User ID:', loginResult.data.user.id);

    // Now fetch bookings
    console.log('\nFetching bookings...');
    const bookingsRes = await fetch(`${baseURL}/bookings?page=1&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const bookingsResult = await bookingsRes.json();
    console.log('\nBookings API response status:', bookingsRes.status);
    console.log('Bookings API response:', JSON.stringify(bookingsResult, null, 2));

    // Also test as equipment owner
    console.log('\n\n=== Testing as Equipment Owner ===');
    const ownerLoginData = {
      email: 'adebayo.oladipo@owner.ng',
      password: 'Owner123!@#'
    };

    const ownerLoginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ownerLoginData)
    });

    const ownerLoginResult = await ownerLoginRes.json();

    if (!ownerLoginResult.data || !ownerLoginResult.data.accessToken) {
      console.log('Owner login failed:', ownerLoginResult);
    } else {
      const ownerToken = ownerLoginResult.data.accessToken;
      console.log('Owner login successful!');
      console.log('User role:', ownerLoginResult.data.user.role);
      console.log('User ID:', ownerLoginResult.data.user.id);

      console.log('\nFetching bookings as equipment owner...');
      const ownerBookingsRes = await fetch(`${baseURL}/bookings?page=1&limit=20`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
          'Content-Type': 'application/json'
        }
      });

      const ownerBookingsResult = await ownerBookingsRes.json();
      console.log('Owner bookings API response status:', ownerBookingsRes.status);
      console.log('Owner bookings API response:', JSON.stringify(ownerBookingsResult, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testBookingAPI();

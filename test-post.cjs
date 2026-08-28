const axios = require('axios');
axios.post('http://localhost:5000/api/auth/register', {
  firstName: 'Test',
  lastName: 'User',
  firebaseToken: 'fake-token'
}).then(console.log).catch(err => console.error(err.response ? err.response.data : err.message));

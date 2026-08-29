const axios = require('axios');
axios.interceptors.request.use(config => {
  console.log('Interceptor config.data type:', typeof config.data);
  return config;
});
axios.post('http://example.com', { hello: 'world' }).catch(() => {});

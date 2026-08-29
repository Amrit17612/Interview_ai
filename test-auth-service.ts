import { authService } from './src/services/auth.service';

const test = async () => {
  const data = { firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'password' };
  const token = 'fake-token';
  
  // mock apiClient
  const apiClient = require('./src/services/api.client').apiClient;
  apiClient.post = async (url: string, payload: any) => {
    console.log('Intercepted POST to', url);
    console.log('Payload:', payload);
    return { data: { success: true } };
  };
  
  await authService.register(data, token);
};
test();

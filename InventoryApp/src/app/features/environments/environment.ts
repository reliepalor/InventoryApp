export const environment = {
  production: false,
  apiUrl: 'http://localhost:5215/api',
  authPaths: {
    login: '/Auth/Login',
    register: '/Auth/Register'
  },
  authStatic: {
    enabled: true,
    users: [
      { username: 'admin', password: 'admin123', token: 'eyJhbGciOiJfZmFrZXRva2VuLmFkbWlu' },
      { username: 'user',  password: 'user1234', token: 'eyJhbGciOiJfZmFrZXRva2VuLnVzZXI' }
    ],
    delayMs: 350
  }
};

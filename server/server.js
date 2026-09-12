const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Use allowedOrigins from app
const allowedOrigins = app.get('allowedOrigins') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://interview-ai-production.vercel.app',
  'https://interview-ai-two-gamma.vercel.app'
];

initializeSocket(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

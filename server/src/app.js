const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Trust proxy for rate limiter (required for Vercel, Render, Nginx, etc.)
// Usually set to 1 if behind a single reverse proxy layer.
app.set('trust proxy', 1);

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://interview-ai-production.vercel.app' // Fallback production URL if needed
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

// Pattern for Vercel deployment URLs specific to this project
// Matches origins like: https://interview-gupf4hq20-amrit17612s-projects.vercel.app
const vercelPreviewRegex = /^https:\/\/interview-[a-zA-Z0-9-]+-amrit17612s-projects\.vercel\.app$/;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check against exact matches or the Vercel preview regex
    if (allowedOrigins.includes(normalizedOrigin) || vercelPreviewRegex.test(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const atsRoutes = require('./routes/atsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const { globalLimiter } = require('./middleware/rateLimiter');

// Apply global rate limiter to all /api routes
app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/interviews', interviewRoutes);

const mongoose = require('mongoose');

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({ 
    success: true, 
    server: 'ok', 
    database: isDbConnected ? 'connected' : 'disconnected' 
  });
});

// 404 and Error handling middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;

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

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

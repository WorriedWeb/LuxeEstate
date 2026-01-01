import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { setAdmin } from './config/seedAdmin.js';
import { requestLogger } from './middleware/requestLogger.js';

const REQUIRED_ENVS = ['PORT', 'MONGODB_URI'];
for (const key of REQUIRED_ENVS) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://luxe-estate-frontend.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

app.options('*', cors());

app.use(bodyParser.json({ limit: '10mb' }));
// app.use(requestLogger);


// Routes

app.get('/', (req, res) => {res.send('API is running...');});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// 404 Handler

app.use((req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl
  });
});

// Global Error Handler

app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    await setAdmin(); 

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

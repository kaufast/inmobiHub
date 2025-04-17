import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://inmobi.mobi'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:5000'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'X-Requested-With']
  }
}; 
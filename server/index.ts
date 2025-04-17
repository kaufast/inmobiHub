import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import path from 'path';
import { config } from './src/config';
import { setupMiddleware } from './src/middleware';
import { setupRoutes } from './src/routes';
import { setupDatabase } from './src/database';

// Debug: Check if DATABASE_URL is loaded
console.log('Environment variables loaded:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'Loaded' : 'Not loaded',
  NODE_ENV: process.env.NODE_ENV
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS
app.use(cors(config.cors));

// Setup middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Setup database
setupDatabase();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error(err);
});

const port = process.env.PORT || config.port;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

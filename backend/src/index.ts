import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { mapRouter } from './routes/mapRoutes';
import { rideRouter } from './routes/rideRoutes';
import { createLiveLocationRouter } from './routes/liveLocationRoutes';
import { LiveLocationService } from './services/liveLocationService';

const app = express();
const liveLocationService = new LiveLocationService();

app.use(
  cors({
    origin: (origin, callback) => {
      // In development, allow common localhost ports
      if (env.NODE_ENV === 'development') {
        if (!origin || 
            origin.startsWith('http://localhost:') || 
            origin.startsWith('http://127.0.0.1:') ||
            env.CLIENT_ORIGIN.includes(origin)) {
          callback(null, true);
          return;
        }
      }
      // In production, check against allowed origins
      if (env.CLIENT_ORIGIN.includes(origin || '')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/map', mapRouter);
app.use('/api/live-location', createLiveLocationRouter(liveLocationService));
app.use('/api/rides', rideRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ message: err instanceof Error ? err.message : 'Unexpected error' });
});

const server = app.listen(env.PORT, () => {
  console.log(`MiCamp backend running on port ${env.PORT}`);
});

process.on('SIGINT', () => {
  liveLocationService.dispose();
  server.close(() => process.exit(0));
});


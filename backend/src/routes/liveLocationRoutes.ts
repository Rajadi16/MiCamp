import { Router } from 'express';
import { z } from 'zod';
import { LiveLocationService } from '../services/liveLocationService';

const updateSchema = z.object({
  userId: z.string().trim().min(1, 'userId is required'),
  displayName: z.string().trim().min(1).max(60).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(500).optional(),
});

export const createLiveLocationRouter = (service: LiveLocationService) => {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ locations: service.getAllLocations() });
  });

  router.post('/', (req, res, next) => {
    try {
      const payload = updateSchema.parse(req.body);
      const snapshot = service.updateLocation(payload);
      res.status(202).json({ location: snapshot });
    } catch (error) {
      next(error);
    }
  });

  router.get('/stream', (req, res, next) => {
    try {
      const clientId = service.registerClient(res);
      req.on('close', () => service.removeClient(clientId));
    } catch (error) {
      next(error);
    }
  });

  return router;
};


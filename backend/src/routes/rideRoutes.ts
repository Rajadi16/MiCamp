import { Router } from 'express';
import { z } from 'zod';
import { RideService } from '../services/rideService';

export const rideRouter = Router();
const rides = new RideService();

const schema = z.object({
  driverId: z.string(),
  from: z.object({ latitude:z.number(), longitude:z.number() }),
  to: z.object({ latitude:z.number(), longitude:z.number() }),
  seatsTotal: z.number().min(1).max(8),
  departTime: z.string().optional(),
  notes:z.string().optional()
});

rideRouter.get('/', (_req, res)=>res.json({ rides: rides.getAll() }));

rideRouter.get('/nearby',(req,res)=>{
  const lat=Number(req.query.lat), lng=Number(req.query.lng);
  const radius=Number(req.query.radius)||1000;
  if (isNaN(lat)||isNaN(lng)) return res.status(400).json({ message:'lat & lng required' });
  res.json({ rides: rides.getNearby(lat,lng,radius) });
});

rideRouter.post('/',(req,res)=>{
  try {
    const payload = schema.parse(req.body);
    res.status(201).json(rides.create(payload));
  } catch(e:any){
    res.status(400).json({ message:e.message });
  }
});

rideRouter.put('/:id/join',(req,res)=>{
  try {
    if(!req.body.userId) return res.status(400).json({ message:'userId required' });
    res.json(rides.join(req.params.id, { userId:req.body.userId, displayName:req.body.displayName }));
  } catch(e:any){ res.status(400).json({ message:e.message }); }
});

rideRouter.put('/:id/leave',(req,res)=>{
  try {
    if(!req.body.userId) return res.status(400).json({ message:'userId required' });
    res.json(rides.leave(req.params.id, req.body.userId));
  } catch(e:any){ res.status(400).json({ message:e.message }); }
});

rideRouter.delete('/:id',(req,res)=>{
  try {
    if(!req.body.driverId) return res.status(400).json({ message:'driverId required' });
    res.json(rides.cancel(req.params.id, req.body.driverId));
  } catch(e:any){ res.status(400).json({ message:e.message }); }
});

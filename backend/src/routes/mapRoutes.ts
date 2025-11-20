import { Router } from 'express';
import { campusLocations } from '../data/campusLocations';
import { env, mapDefaults } from '../config/env';
import { MapConfigResponse, CampusLocation } from '../types/map';
import { z } from 'zod';

export const mapRouter = Router();

// In-memory storage (in production, use a database)
let locationsStore: CampusLocation[] = [...campusLocations];

mapRouter.get('/', (_req, res) => {
  const response: MapConfigResponse = {
    campusCenter: mapDefaults.center,
    defaultZoom: mapDefaults.zoom,
    campusBounds: mapDefaults.bounds,
    locations: locationsStore,
  };

  res.json(response);
});

mapRouter.get('/search', (req, res) => {
  const query = (req.query.q as string)?.trim().toLowerCase() ?? '';

  if (!query) {
    return res.json({ results: campusLocations });
  }

  const results = locationsStore.filter((location) => {
    const haystack = `${location.name} ${location.description} ${location.tags.join(' ')}`.toLowerCase();
    return haystack.includes(query);
  });

  res.json({ results });
});

mapRouter.get('/locations/:id', (req, res) => {
  const location = locationsStore.find((item) => item.id === req.params.id);
  if (!location) {
    return res.status(404).json({ message: 'Location not found' });
  }

  res.json(location);
});

// Admin endpoints for managing locations
const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  description: z.string(),
  type: z.enum(['academic', 'administrative', 'facility', 'food', 'health', 'residence', 'parking', 'recreation']),
  latitude: z.number(),
  longitude: z.number(),
  floor: z.string().optional(),
  tags: z.array(z.string()),
  icon: z.string(),
  hours: z.string().optional(),
});

mapRouter.post('/admin/locations', (req, res) => {
  try {
    const location = locationSchema.parse(req.body);
    
    // Check if ID already exists
    if (locationsStore.find((loc) => loc.id === location.id)) {
      return res.status(400).json({ message: 'Location with this ID already exists' });
    }

    locationsStore.push(location);
    res.status(201).json({ message: 'Location added successfully', location });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid location data', errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to add location' });
  }
});

mapRouter.put('/admin/locations/:id', (req, res) => {
  try {
    const location = locationSchema.parse({ ...req.body, id: req.params.id });
    const index = locationsStore.findIndex((loc) => loc.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Location not found' });
    }

    locationsStore[index] = location;
    res.json({ message: 'Location updated successfully', location });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid location data', errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to update location' });
  }
});

mapRouter.delete('/admin/locations/:id', (req, res) => {
  const index = locationsStore.findIndex((loc) => loc.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Location not found' });
  }

  locationsStore.splice(index, 1);
  res.json({ message: 'Location deleted successfully' });
});

mapRouter.get('/admin/locations', (_req, res) => {
  res.json({ locations: locationsStore });
});


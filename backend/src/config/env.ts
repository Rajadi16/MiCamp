import path from 'path';
import { config } from 'dotenv';
import { z } from 'zod';

config({
  path: path.resolve(process.cwd(), '.env'),
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z
    .string()
    .default('http://localhost:5500')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  CAMPUS_CENTER_LAT: z.coerce.number().default(12.90074),
  CAMPUS_CENTER_LNG: z.coerce.number().default(77.51738),
});

export const env = envSchema.parse(process.env);

export const mapDefaults = {
  center: {
    lat: env.CAMPUS_CENTER_LAT,
    lng: env.CAMPUS_CENTER_LNG,
  },
  zoom: 17,
  bounds: {
    northeast: {
      lat: env.CAMPUS_CENTER_LAT + 0.01,
      lng: env.CAMPUS_CENTER_LNG + 0.01,
    },
    southwest: {
      lat: env.CAMPUS_CENTER_LAT - 0.01,
      lng: env.CAMPUS_CENTER_LNG - 0.01,
    },
  },
};


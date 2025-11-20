export type CampusLocationType =
  | 'academic'
  | 'administrative'
  | 'facility'
  | 'food'
  | 'health'
  | 'residence'
  | 'parking'
  | 'recreation';

export interface CampusLocation {
  id: string;
  name: string;
  code?: string;
  description: string;
  type: CampusLocationType;
  latitude: number;
  longitude: number;
  floor?: string;
  tags: string[];
  icon: string;
  hours?: string;
}

export interface MapConfigResponse {
  campusCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  campusBounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  locations: CampusLocation[];
}

export interface LiveLocationPayload {
  userId: string;
  displayName?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LiveLocationSnapshot extends LiveLocationPayload {
  updatedAt: string;
}


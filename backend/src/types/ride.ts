export type LatLng = { latitude: number; longitude: number };

export type RideStatus = 'open' | 'full' | 'cancelled' | 'completed';

export interface Passenger {
  userId: string;
  displayName?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  from: LatLng;
  to: LatLng;
  departTime?: string;
  seatsTotal: number;
  seatsAvailable: number;
  passengers: Passenger[];
  notes?: string;
  status: RideStatus;
  createdAt: string;
}

import { Ride, Passenger } from '../types/ride';
import { v4 as uuidv4 } from 'uuid';

export class RideService {
  private rides: Ride[] = [];

  getAll() { return this.rides.slice().reverse(); }

  getById(id: string) { return this.rides.find(r => r.id === id) ?? null; }

  private dist(lat1:number, lon1:number, lat2:number, lon2:number) {
    const toRad = (v:number)=>v*Math.PI/180;
    const R = 6371000;
    const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(a));
  }

  getNearby(lat:number, lng:number, radius=1000) {
    return this.rides.filter(r => r.status === 'open' &&
      this.dist(lat,lng,r.from.latitude,r.from.longitude) <= radius);
  }

  create(payload:any) {
    const ride: Ride = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      seatsAvailable: payload.seatsTotal,
      passengers: [],
      status: 'open',
      ...payload
    };
    this.rides.push(ride);
    return ride;
  }

  join(id:string, passenger:Passenger) {
    const ride = this.getById(id);
    if (!ride) throw new Error('Ride not found');
    if (ride.status !== 'open') throw new Error('Ride closed');
    if (ride.passengers.find(p=>p.userId===passenger.userId))
      throw new Error('Already joined');
    if (ride.seatsAvailable <= 0) throw new Error('No seats');

    ride.passengers.push(passenger);
    ride.seatsAvailable--;
    if (ride.seatsAvailable===0) ride.status='full';
    return ride;
  }

  leave(id:string, userId:string) {
    const ride = this.getById(id);
    if (!ride) throw new Error('Ride not found');
    const idx = ride.passengers.findIndex(p=>p.userId===userId);
    if (idx===-1) throw new Error('Not a passenger');
    ride.passengers.splice(idx,1);
    ride.seatsAvailable++;
    ride.status='open';
    return ride;
  }

  cancel(id:string, driverId:string) {
    const ride = this.getById(id);
    if (!ride) throw new Error('Ride not found');
    if (ride.driverId !== driverId) throw new Error('Not driver');
    ride.status = 'cancelled';
    return ride;
  }
}

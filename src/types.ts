export type Page = 'home' | 'map' | 'emergency' | 'emergency-map' | 'summary' | 'cpr';

export interface AEDLocation {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  operator?: string;
  access?: string;
  note?: string;
  distance?: number; // meters
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface RescueSession {
  startTime: Date;
  aedFound: boolean;
  aedFoundTime?: Date;
  calledEmergency: boolean;
  calledEmergencyTime?: Date;
  startedCompressions: boolean;
  startedCompressionsTime?: Date;
}

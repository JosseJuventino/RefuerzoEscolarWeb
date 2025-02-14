import * as geoip from 'geoip-lite';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeoLocationService {
  getLocation(ipAddress: string): { country?: string; region?: string } {
    const geo = geoip.lookup(ipAddress);
    return {
      country: geo?.country || 'Unknown',
      region: geo?.region || 'Unknown',
    };
  }
}
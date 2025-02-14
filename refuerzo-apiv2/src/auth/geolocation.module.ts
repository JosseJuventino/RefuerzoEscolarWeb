// geo-location.module.ts
import { Module } from '@nestjs/common';
import { GeoLocationService } from './geolocation.service';

@Module({
  providers: [GeoLocationService],
  exports: [GeoLocationService]  
})
export class GeoLocationModule {}
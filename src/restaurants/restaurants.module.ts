import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';

@Module({
  imports: [],
  controllers: [],
  providers: [RestaurantsResolver],
  exports: [],
})
export class RestaurantsModule {}

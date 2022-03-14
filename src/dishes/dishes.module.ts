import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { DishesResolver } from './dishes.resolver';

@Module({
  providers: [DishesService, DishesResolver]
})
export class DishesModule {}

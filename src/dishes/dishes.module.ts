import { Module } from '@nestjs/common';
import { DishesService } from './dishes.service';
import { DishesResolver } from './dishes.resolver';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category, Dish])],
  providers: [DishesService, DishesResolver, RestaurantsService],
})
export class DishesModule {}

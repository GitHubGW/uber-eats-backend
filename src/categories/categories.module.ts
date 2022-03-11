import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [CategoriesResolver, CategoriesService, RestaurantsService],
})
export class CategoriesModule {}

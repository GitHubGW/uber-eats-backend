import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/createRestaurant.dto';
import { EditRestaurantDto } from './dtos/editRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(@InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>) {}

  async getAllRestaurants(): Promise<Restaurant[]> {
    const foundAllRestaurants = await this.restaurantsRepository.find();
    return foundAllRestaurants;
  }

  async createRestaurant({ name, isOwner, address, ownerName, categoryName }: CreateRestaurantDto): Promise<boolean> {
    try {
      const createdRestaurant: Restaurant = this.restaurantsRepository.create({
        name,
        isOwner,
        address,
        ownerName,
        categoryName,
      });
      const savedRestaurant: Restaurant = await this.restaurantsRepository.save(createdRestaurant);
      return true;
    } catch (error) {
      console.log('createRestaurant error');
      return false;
    }
  }

  async editRestaurant({ id, data }: EditRestaurantDto): Promise<boolean> {
    try {
      this.restaurantsRepository.update(id, { ...data });
      return true;
    } catch (error) {
      console.log('editRestaurant error');
      return false;
    }
  }
}

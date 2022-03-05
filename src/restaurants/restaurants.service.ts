import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/createRestaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async createRestaurant(
    { name, address, imageUrl, categoryName }: CreateRestaurantInput,
    loggedInUser: User,
  ): Promise<CreateRestaurantOutput> {
    try {
      const createdRestaurant: Restaurant = this.restaurantsRepository.create({ name, address, imageUrl });
      createdRestaurant.owner = loggedInUser;

      const foundCategory: Category | undefined = await this.categoryRepository.findOne({ name: categoryName });

      if (foundCategory === undefined) {
        const createdCategory: Category = this.categoryRepository.create({ name: categoryName });
        await this.categoryRepository.save(createdCategory);
        createdRestaurant.category = createdCategory;
      } else {
        createdRestaurant.category = foundCategory;
      }

      await this.restaurantsRepository.save(createdRestaurant);
      return { ok: true, message: '레스토랑 생성에 성공하였습니다.' };
    } catch (error) {
      console.log('createRestaurant error');
      return { ok: false, message: '레스토랑 생성에 실패하였습니다.' };
    }
  }
}

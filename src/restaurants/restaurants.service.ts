import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/createRestaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/editRestaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

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

  async editRestaurant(
    { restaurantId, name, address, imageUrl, categoryName }: EditRestaurantInput,
    loggedInUser: User,
  ): Promise<EditRestaurantOutput> {
    try {
      let foundOrCreatedCategory: Category | undefined;
      const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne({ id: restaurantId });

      if (foundRestaurant === undefined) {
        return { ok: false, message: '존재하지 않는 레스토랑입니다.' };
      }

      if (foundRestaurant.ownerId !== loggedInUser.id) {
        return { ok: false, message: '수정할 수 없는 레스토랑입니다.' };
      }

      if (name) {
        const countedRestaurant: number = await this.restaurantsRepository.count({ name });
        if (countedRestaurant !== 0) {
          return { ok: false, message: '이미 사용 중인 레스토랑 이름입니다.' };
        }
      }

      if (categoryName) {
        const foundCategory: Category | undefined = await this.categoryRepository.findOne({ name: categoryName });
        if (foundCategory === undefined) {
          foundOrCreatedCategory = this.categoryRepository.create({ name: categoryName });
          await this.categoryRepository.save(foundOrCreatedCategory);
        } else {
          foundOrCreatedCategory = foundCategory;
        }
      }

      await this.restaurantsRepository.save([
        { id: restaurantId, name, address, imageUrl, category: foundOrCreatedCategory },
      ]);
      return { ok: true, message: '레스토랑 수정에 성공하였습니다.' };
    } catch (error) {
      console.log('editRestaurant error');
      return { ok: false, message: '레스토랑 수정에 실패하였습니다.' };
    }
  }
}

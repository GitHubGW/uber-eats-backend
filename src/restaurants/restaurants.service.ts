import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Like, Raw, Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/createRestaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/deleteRestaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/editRestaurant.dto';
import { Category } from '../categories/entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { SeeAllRestaurantsInput, SeeAllRestaurantsOutput } from './dtos/seeAllRestaurants.dto';
import { SeeRestaurantInput, SeeRestaurantOutput } from './dtos/seeRestaurant.dto';
import { SearchRestaurantsInput, SearchRestaurantsOutput } from './dtos/searchRestaurants.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async seeAllRestaurants({ page }: SeeAllRestaurantsInput): Promise<SeeAllRestaurantsOutput> {
    try {
      const TAKE_NUMBER: number = 6;
      const countedRestaurants: number = await this.restaurantsRepository.count();
      const foundAllRestaurants: Restaurant[] = await this.restaurantsRepository.find({
        skip: (page - 1) * TAKE_NUMBER,
        take: TAKE_NUMBER,
      });

      return {
        ok: true,
        message: '전체 레스토랑 보기에 성공하였습니다.',
        restaurants: foundAllRestaurants,
        totalPages: Math.ceil(countedRestaurants / TAKE_NUMBER),
        totalRestaurants: countedRestaurants,
      };
    } catch (error) {
      console.log('seeAllRestaurants error');
      return { ok: false, message: '전체 레스토랑 보기에 실패하였습니다.' };
    }
  }

  async seeRestaurant({ restaurantId }: SeeRestaurantInput): Promise<SeeRestaurantOutput> {
    try {
      const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne(restaurantId);

      if (foundRestaurant === undefined) {
        return { ok: false, message: '존재하지 않는 레스토랑입니다.' };
      }

      return { ok: true, message: '레스토랑 보기에 성공하였습니다.', restaurant: foundRestaurant };
    } catch (error) {
      console.log('seeRestaurant error');
      return { ok: false, message: '레스토랑 보기에 실패하였습니다.' };
    }
  }

  async searchRestaurants({ restaurantName, page }: SearchRestaurantsInput): Promise<SearchRestaurantsOutput> {
    try {
      const TAKE_NUMBER: number = 6;
      const countedRestaurants: number = await this.restaurantsRepository.count({ name: Like(`%${restaurantName}%`) });
      const foundRestaurants: Restaurant[] = await this.restaurantsRepository.find({
        where: { name: ILike(`%${restaurantName}%`) },
        skip: (page - 1) * TAKE_NUMBER,
        take: TAKE_NUMBER,
      });

      return {
        ok: true,
        message: '레스토랑 검색에 성공하였습니다.',
        restaurants: foundRestaurants,
        totalPages: Math.ceil(countedRestaurants / TAKE_NUMBER),
        totalRestaurants: countedRestaurants,
      };
    } catch (error) {
      console.log('searchRestaurants error');
      return { ok: false, message: '레스토랑 검색에 실패하였습니다.' };
    }
  }

  async createRestaurant(
    { name, address, imageUrl, categoryName }: CreateRestaurantInput,
    loggedInUser: User,
  ): Promise<CreateRestaurantOutput> {
    try {
      const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne({ name });

      if (foundRestaurant) {
        return { ok: false, message: '이미 존재하는 레스토랑입니다.' };
      }

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

  async deleteRestaurant({ restaurantId }: DeleteRestaurantInput, loggedInUser: User): Promise<DeleteRestaurantOutput> {
    try {
      const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne({ id: restaurantId });

      if (foundRestaurant === undefined) {
        return { ok: false, message: '존재하지 않는 레스토랑입니다.' };
      }

      if (foundRestaurant.ownerId !== loggedInUser.id) {
        return { ok: false, message: '삭제할 수 없는 레스토랑입니다.' };
      }

      await this.restaurantsRepository.delete(restaurantId);
      return { ok: true, message: '레스토랑 삭제에 성공하였습니다.' };
    } catch (error) {
      console.log('deleteRestaurant error');
      return { ok: false, message: '레스토랑 삭제에 실패하였습니다.' };
    }
  }
}

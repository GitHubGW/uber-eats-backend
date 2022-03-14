import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { SeeAllCategoriesOutput } from './dtos/seeAllCategories.dto';
import { SeeCategoryInput, SeeCategoryOutput } from './dtos/seeCategory.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async totalRestaurants(category: Category): Promise<number> {
    try {
      const countedRestaurants: number = await this.restaurantsRepository.count({ category });
      return countedRestaurants;
    } catch (error) {
      console.log('totalRestaurants error');
      return 0;
    }
  }

  async seeAllCategories(): Promise<SeeAllCategoriesOutput> {
    try {
      const foundAllCategories: Category[] = await this.categoryRepository.find();
      return { ok: true, message: '전체 카테고리 보기에 성공하였습니다.', category: foundAllCategories };
    } catch (error) {
      console.log('seeAllCategories error');
      return { ok: false, message: '전체 카테고리 보기에 실패하였습니다.' };
    }
  }

  async seeCategory({ categoryName, page }: SeeCategoryInput): Promise<SeeCategoryOutput> {
    try {
      const TAKE_NUMBER: number = 5;
      const foundCategory: Category | undefined = await this.categoryRepository.findOne({ name: categoryName });

      if (foundCategory === undefined) {
        return { ok: false, message: '존재하지 않는 카테고리입니다.' };
      }

      const countedRestaurants: number = await this.restaurantsRepository.count({ category: foundCategory });
      const foundRestaurants: Restaurant[] = await this.restaurantsRepository.find({
        where: { category: foundCategory },
        skip: (page - 1) * TAKE_NUMBER,
        take: TAKE_NUMBER,
      });
      foundCategory.restaurants = foundRestaurants;

      return {
        ok: true,
        message: '카테고리 보기에 성공하였습니다.',
        category: foundCategory,
        totalPages: Math.ceil(countedRestaurants / TAKE_NUMBER),
        totalRestaurants: countedRestaurants,
      };
    } catch (error) {
      console.log('seeCategory error');
      return { ok: false, message: '카테고리 보기에 실패하였습니다.' };
    }
  }
}

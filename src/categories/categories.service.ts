import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { SeeAllCategoriesOutput } from './dtos/seeAllCategories.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async seeAllCategories(): Promise<SeeAllCategoriesOutput> {
    try {
      const foundAllCategories: Category[] = await this.categoryRepository.find();
      return { ok: true, message: '전체 카테고리 보기에 성공하였습니다.', category: foundAllCategories };
    } catch (error) {
      console.log('seeAllCategories error');
      return { ok: false, message: '전체 카테고리 보기에 실패하였습니다.' };
    }
  }
}

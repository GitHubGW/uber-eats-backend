import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { CategoriesService } from './categories.service';
import { SeeAllCategoriesOutput } from './dtos/seeAllCategories.dto';
import { SeeCategoryInput, SeeCategoryOutput } from './dtos/seeCategory.dto';
import { Category } from './entities/category.entity';

const mockRestaurantRepository = {
  count: jest.fn(),
  find: jest.fn(),
};

const mockCategoryRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
};

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Restaurant), useValue: mockRestaurantRepository },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepository },
      ],
    }).compile();

    categoriesService = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(categoriesService).toBeDefined();
  });

  describe('totalRestaurants', () => {
    const category: Category = {
      id: 1,
      name: 'korean food',
      imageUrl: '',
      restaurants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should see total restaurants if restaurants exist', async () => {
      const countedRestaurants = 10;
      mockRestaurantRepository.count.mockResolvedValue(countedRestaurants);
      const totalRestaurants: number = await categoriesService.totalRestaurants(category);

      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.count).toBeCalledWith({ category });
      expect(totalRestaurants).toBe(countedRestaurants);
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.count.mockRejectedValue(new Error());
      const totalRestaurants: number = await categoriesService.totalRestaurants(category);

      expect(mockRestaurantRepository.count).toBeCalled();
      expect(totalRestaurants).toBe(0);
    });
  });

  describe('seeAllCategories', () => {
    it('should see all categories if category exist', async () => {
      const foundAllCategories: Category[] = [];
      mockCategoryRepository.find.mockResolvedValue(foundAllCategories);
      const seeAllCategoriesOutput: SeeAllCategoriesOutput = await categoriesService.seeAllCategories();

      expect(mockCategoryRepository.find).toBeCalled();
      expect(seeAllCategoriesOutput).toEqual({
        ok: true,
        message: '전체 카테고리 보기에 성공하였습니다.',
        category: foundAllCategories,
      });
    });

    it('should fail on exception', async () => {
      mockCategoryRepository.find.mockRejectedValue(new Error());
      const seeAllCategoriesOutput: SeeAllCategoriesOutput = await categoriesService.seeAllCategories();

      expect(mockCategoryRepository.find).toBeCalled();
      expect(seeAllCategoriesOutput).toEqual({ ok: false, message: '전체 카테고리 보기에 실패하였습니다.' });
    });
  });

  describe('seeCategory', () => {
    const seeCategoryInput: SeeCategoryInput = { categoryName: 'korean food', page: 1 };

    it('should not see category if category does not exist', async () => {
      const foundCategory = undefined;
      mockCategoryRepository.findOne.mockResolvedValue(foundCategory);
      const seeCategoryOutput: SeeCategoryOutput = await categoriesService.seeCategory(seeCategoryInput);

      expect(mockCategoryRepository.findOne).toBeCalled();
      expect(mockCategoryRepository.findOne).toBeCalledWith({ name: seeCategoryInput.categoryName });
      expect(seeCategoryOutput).toEqual({ ok: false, message: '존재하지 않는 카테고리입니다.' });
    });

    it('should seee category if category exist', async () => {
      const TAKE_NUMBER: number = 6;
      const foundCategory: Category = {
        id: 1,
        name: 'korean food',
        imageUrl: '',
        restaurants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const countedRestaurants: number = 10;
      const foundRestaurants: Restaurant[] = [];
      mockCategoryRepository.findOne.mockResolvedValue(foundCategory);
      mockRestaurantRepository.count.mockResolvedValue(countedRestaurants);
      mockRestaurantRepository.find.mockResolvedValue(foundRestaurants);
      const seeCategoryOutput: SeeCategoryOutput = await categoriesService.seeCategory(seeCategoryInput);

      expect(mockCategoryRepository.findOne).toBeCalled();
      expect(mockCategoryRepository.findOne).toBeCalledWith({ name: seeCategoryInput.categoryName });
      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.count).toBeCalledWith({ category: foundCategory });
      expect(mockRestaurantRepository.find).toBeCalled();
      expect(mockRestaurantRepository.find).toBeCalledWith({
        where: { category: foundCategory },
        skip: (seeCategoryInput.page - 1) * TAKE_NUMBER,
        take: TAKE_NUMBER,
      });
      expect(seeCategoryOutput).toEqual({
        ok: true,
        message: '카테고리 보기에 성공하였습니다.',
        category: foundCategory,
        totalPages: Math.ceil(countedRestaurants / TAKE_NUMBER),
        totalRestaurants: countedRestaurants,
      });
    });

    it('should fail on exception', async () => {
      mockCategoryRepository.findOne.mockRejectedValue(new Error());
      const seeCategoryOutput: SeeCategoryOutput = await categoriesService.seeCategory(seeCategoryInput);

      expect(mockCategoryRepository.findOne).toBeCalled();
      expect(seeCategoryOutput).toEqual({ ok: false, message: '카테고리 보기에 실패하였습니다.' });
    });
  });
});

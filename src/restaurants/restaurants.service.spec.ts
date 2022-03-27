import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { ILike, Like } from 'typeorm';
import { SearchRestaurantsInput, SearchRestaurantsOutput } from './dtos/searchRestaurants.dto';
import { SeeAllRestaurantsInput, SeeAllRestaurantsOutput } from './dtos/seeAllRestaurants.dto';
import { SeeRestaurantInput, SeeRestaurantOutput } from './dtos/seeRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

const mockRestaurantRepository = {
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockCategoryRepository = {};

describe('RestaurantsService', () => {
  let restaurantsService: RestaurantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: getRepositoryToken(Restaurant), useValue: mockRestaurantRepository },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepository },
      ],
    }).compile();

    restaurantsService = module.get(RestaurantsService);
  });

  it('should be defined', () => {
    expect(restaurantsService).toBeDefined();
  });

  describe('seeAllRestaurants', () => {
    const seeAllRestaurantsInput: SeeAllRestaurantsInput = { page: 1 };

    it('should see all restaurants if restaurant exist', async () => {
      const TAKE_NUMBER: number = 6;
      const countedRestaurants: number = 10;
      const foundAllRestaurants: Restaurant[] = [];
      mockRestaurantRepository.count.mockResolvedValue(countedRestaurants);
      mockRestaurantRepository.find.mockResolvedValue(foundAllRestaurants);
      const seeAllRestaurantsOutput: SeeAllRestaurantsOutput = await restaurantsService.seeAllRestaurants(
        seeAllRestaurantsInput,
      );

      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.find).toBeCalled();
      expect(mockRestaurantRepository.find).toHaveBeenCalledWith({
        skip: (seeAllRestaurantsInput.page - 1) * TAKE_NUMBER,
        take: TAKE_NUMBER,
      });
      expect(seeAllRestaurantsOutput).toEqual({
        ok: true,
        message: '전체 레스토랑 보기에 성공하였습니다.',
        restaurants: [],
        totalPages: 2,
        totalRestaurants: 10,
      });
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.count.mockRejectedValue(new Error());
      const seeAllRestaurantsOutput: SeeAllRestaurantsOutput = await restaurantsService.seeAllRestaurants(
        seeAllRestaurantsInput,
      );

      expect(mockRestaurantRepository.count).toBeCalled();
      expect(seeAllRestaurantsOutput).toEqual({ ok: false, message: '전체 레스토랑 보기에 실패하였습니다.' });
    });
  });

  describe('seeRestaurant', () => {
    const seeRestaurantInput: SeeRestaurantInput = { restaurantId: 1 };

    it('should not see if restaurant does not exist', async () => {
      const foundRestaurant = undefined;
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const seeRestaurantOutput: SeeRestaurantOutput = await restaurantsService.seeRestaurant(seeRestaurantInput);

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toHaveBeenCalledWith(seeRestaurantInput.restaurantId, {
        relations: ['dishes'],
      });
      expect(seeRestaurantOutput).toEqual({ ok: false, message: '존재하지 않는 레스토랑입니다.' });
    });

    it('should see if restaurant exist', async () => {
      const foundRestaurant = [];
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const seeRestaurantOutput: SeeRestaurantOutput = await restaurantsService.seeRestaurant(seeRestaurantInput);

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toHaveBeenCalledWith(seeRestaurantInput.restaurantId, {
        relations: ['dishes'],
      });
      expect(seeRestaurantOutput).toEqual({ ok: true, message: '레스토랑 보기에 성공하였습니다.', restaurant: [] });
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.findOne.mockRejectedValue(new Error());
      const seeRestaurantOutput: SeeRestaurantOutput = await restaurantsService.seeRestaurant(seeRestaurantInput);

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(seeRestaurantOutput).toEqual({ ok: false, message: '레스토랑 보기에 실패하였습니다.' });
    });
  });

  describe('searchRestaurants', () => {
    const searchRestaurantsInput: SearchRestaurantsInput = { restaurantName: 'test restaurant', page: 1 };

    it('should search restaurants if restaurant exist', async () => {
      const TAKE_NUMBER: number = 6;
      const countedRestaurants: number = 10;
      const foundRestaurants: Restaurant[] = [];
      mockRestaurantRepository.count.mockResolvedValue(countedRestaurants);
      mockRestaurantRepository.find(foundRestaurants);
      const searchRestaurantsOutput: SearchRestaurantsOutput = await restaurantsService.searchRestaurants(
        searchRestaurantsInput,
      );

      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.find).toBeCalled();
      expect(mockRestaurantRepository.count).toBeCalledWith({
        name: Like(`%${searchRestaurantsInput.restaurantName}%`),
      });
      expect(mockRestaurantRepository.find).toBeCalledWith({
        where: { name: ILike(`%${searchRestaurantsInput.restaurantName}%`) },
        skip: (searchRestaurantsInput.page - 1) * TAKE_NUMBER,
        take: TAKE_NUMBER,
      });
      expect(searchRestaurantsOutput).toEqual({
        ok: true,
        message: '레스토랑 검색에 성공하였습니다.',
        restaurants: [],
        totalPages: 2,
        totalRestaurants: 10,
      });
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.count.mockRejectedValue(new Error());
      const searchRestaurantsOutput: SearchRestaurantsOutput = await restaurantsService.searchRestaurants(
        searchRestaurantsInput,
      );

      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.count).toBeCalledWith({
        name: Like(`%${searchRestaurantsInput.restaurantName}%`),
      });
      expect(searchRestaurantsOutput).toEqual({ ok: false, message: '레스토랑 검색에 실패하였습니다.' });
    });
  });

  describe('createRestaurant', () => {
    it('should fail on exception', async () => {});
  });

  describe('editRestaurant', () => {
    it('should fail on exception', async () => {});
  });

  describe('deleteRestaurant', () => {
    it('should fail on exception', async () => {});
  });
});

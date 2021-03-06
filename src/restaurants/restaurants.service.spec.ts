import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { ILike, Like } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/createRestaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/deleteRestaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/editRestaurant.dto';
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

const mockCategoryRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const loggedInUser: User = {
  id: 1,
  email: 'user@gmail.com',
  username: 'user',
  password: '1234',
  role: Role.Owner,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  async hashPassword() {},
};

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
        message: '?????? ???????????? ????????? ?????????????????????.',
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
      expect(seeAllRestaurantsOutput).toEqual({ ok: false, message: '?????? ???????????? ????????? ?????????????????????.' });
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
      expect(seeRestaurantOutput).toEqual({ ok: false, message: '???????????? ?????? ?????????????????????.' });
    });

    it('should see if restaurant exist', async () => {
      const foundRestaurant = [];
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const seeRestaurantOutput: SeeRestaurantOutput = await restaurantsService.seeRestaurant(seeRestaurantInput);

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toHaveBeenCalledWith(seeRestaurantInput.restaurantId, {
        relations: ['dishes'],
      });
      expect(seeRestaurantOutput).toEqual({ ok: true, message: '???????????? ????????? ?????????????????????.', restaurant: [] });
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.findOne.mockRejectedValue(new Error());
      const seeRestaurantOutput: SeeRestaurantOutput = await restaurantsService.seeRestaurant(seeRestaurantInput);

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(seeRestaurantOutput).toEqual({ ok: false, message: '???????????? ????????? ?????????????????????.' });
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
        message: '???????????? ????????? ?????????????????????.',
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
      expect(searchRestaurantsOutput).toEqual({ ok: false, message: '???????????? ????????? ?????????????????????.' });
    });
  });

  describe('createRestaurant', () => {
    const createRestaurantInput: CreateRestaurantInput = {
      name: 'test restaurant2',
      address: 'busan',
      imageUrl: '',
      categoryName: 'korean food',
    };

    it('should not create restaurant if restaurant already exist', async () => {
      const foundRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: 2,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);

      const createRestaurantOutput: CreateRestaurantOutput = await restaurantsService.createRestaurant(
        createRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ name: createRestaurantInput.name });
      expect(createRestaurantOutput).toEqual({ ok: false, message: '?????? ???????????? ?????????????????????.' });
    });

    it('should create restaurant and category if restaurant and category does not exist', async () => {
      const foundRestaurant = undefined;
      const createdRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: loggedInUser.id,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const foundCategory = undefined;
      const createdCategory: Category = {
        id: 1,
        name: createRestaurantInput.categoryName,
        imageUrl: createRestaurantInput.imageUrl,
        restaurants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      mockRestaurantRepository.create.mockResolvedValue(createdRestaurant);
      mockCategoryRepository.findOne.mockResolvedValue(foundCategory);
      mockCategoryRepository.create.mockResolvedValue(createdCategory);
      const createRestaurantOutput: CreateRestaurantOutput = await restaurantsService.createRestaurant(
        createRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ name: createRestaurantInput.name });
      expect(mockRestaurantRepository.create).toBeCalled();
      expect(mockRestaurantRepository.create).toBeCalledWith({
        name: createRestaurantInput.name,
        address: createRestaurantInput.address,
        imageUrl: createRestaurantInput.imageUrl,
      });
      expect(mockCategoryRepository.findOne).toBeCalled();
      expect(mockCategoryRepository.findOne).toBeCalledWith({ name: createRestaurantInput.categoryName });
      expect(mockCategoryRepository.create).toBeCalled();
      expect(mockCategoryRepository.create).toBeCalledWith({ name: createRestaurantInput.categoryName });
      expect(mockCategoryRepository.save).toBeCalled();
      expect(mockCategoryRepository.save).toBeCalledWith(createdCategory);
      expect(createRestaurantOutput).toEqual({ ok: true, message: '???????????? ????????? ?????????????????????.' });
    });

    it('should create restaurant and should not create category if restaurant does not exist and category exist', async () => {
      const foundRestaurant = undefined;
      const createdRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: loggedInUser.id,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const foundCategory: Category = {
        id: 2,
        name: 'fast food',
        imageUrl: '',
        restaurants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      mockRestaurantRepository.create.mockResolvedValue(createdRestaurant);
      mockCategoryRepository.findOne.mockResolvedValue(foundCategory);
      const createRestaurantOutput: CreateRestaurantOutput = await restaurantsService.createRestaurant(
        createRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ name: createRestaurantInput.name });
      expect(mockRestaurantRepository.create).toBeCalled();
      expect(mockRestaurantRepository.create).toBeCalledWith({
        name: createRestaurantInput.name,
        address: createRestaurantInput.address,
        imageUrl: createRestaurantInput.imageUrl,
      });
      expect(mockCategoryRepository.findOne).toBeCalled();
      expect(mockCategoryRepository.findOne).toBeCalledWith({ name: createRestaurantInput.categoryName });
      expect(createRestaurantOutput).toEqual({ ok: true, message: '???????????? ????????? ?????????????????????.' });
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.findOne.mockRejectedValue(new Error());
      const createRestaurantOutput: CreateRestaurantOutput = await restaurantsService.createRestaurant(
        createRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(createRestaurantOutput).toEqual({ ok: false, message: '???????????? ????????? ?????????????????????.' });
    });
  });

  describe('editRestaurant', () => {
    const editRestaurantInput: EditRestaurantInput = {
      restaurantId: 1,
      name: 'test restaurant',
      address: 'seoul',
      imageUrl: '',
      categoryName: 'korean food',
    };

    it('should not edit restaurant if restaurant does not exist', async () => {
      const foundRestaurant = undefined;
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const editRestaurantOutput: EditRestaurantOutput = await restaurantsService.editRestaurant(
        editRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: editRestaurantInput.restaurantId });
      expect(editRestaurantOutput).toEqual({ ok: false, message: '???????????? ?????? ?????????????????????.' });
    });

    it('should not edit restaurant if restaurant owner is not correct', async () => {
      const foundRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: 2,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const editRestaurantOutput: EditRestaurantOutput = await restaurantsService.editRestaurant(
        editRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: editRestaurantInput.restaurantId });
      expect(editRestaurantOutput).toEqual({ ok: false, message: '????????? ??? ?????? ?????????????????????.' });
    });

    it('should not edit restaurant if restaurant name exist', async () => {
      const foundRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: 1,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const countedRestaurant: number = 1;
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      mockRestaurantRepository.count.mockResolvedValue(countedRestaurant);
      const editRestaurantOutput: EditRestaurantOutput = await restaurantsService.editRestaurant(
        editRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: editRestaurantInput.restaurantId });
      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.count).toBeCalledWith({ name: editRestaurantInput.name });
      expect(editRestaurantOutput).toEqual({ ok: false, message: '?????? ?????? ?????? ???????????? ???????????????.' });
    });

    it('should edit restaurant and should create category if restaurant owner is correct and restaurant name does not exist and category does not exist', async () => {
      let foundOrCreatedCategory: Category | undefined;
      const foundRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: 1,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const countedRestaurant: number = 0;
      const foundCategory = undefined;
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      mockRestaurantRepository.count.mockResolvedValue(countedRestaurant);
      mockCategoryRepository.findOne.mockResolvedValue(foundCategory);
      mockCategoryRepository.create.mockResolvedValue(foundOrCreatedCategory);
      const editRestaurantOutput: EditRestaurantOutput = await restaurantsService.editRestaurant(
        editRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: editRestaurantInput.restaurantId });
      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.count).toBeCalledWith({ name: editRestaurantInput.name });
      expect(mockCategoryRepository.findOne).toBeCalled();
      expect(mockCategoryRepository.findOne).toBeCalledWith({ name: editRestaurantInput.categoryName });
      expect(mockCategoryRepository.create).toBeCalled();
      expect(mockCategoryRepository.create).toBeCalledWith({ name: editRestaurantInput.categoryName });
      expect(mockCategoryRepository.save).toBeCalled();
      expect(mockCategoryRepository.save).toBeCalledWith(foundOrCreatedCategory);
      expect(mockRestaurantRepository.save).toBeCalled();
      expect(mockRestaurantRepository.save).toBeCalledWith([
        {
          id: editRestaurantInput.restaurantId,
          name: editRestaurantInput.name,
          address: editRestaurantInput.address,
          imageUrl: editRestaurantInput.imageUrl,
          category: foundOrCreatedCategory,
        },
      ]);
      expect(editRestaurantOutput).toEqual({ ok: true, message: '???????????? ????????? ?????????????????????.' });
    });

    it('should edit restaurant and should not create category if restaurant owner is correct and restaurant name does not exist and category exist', async () => {
      let foundOrCreatedCategory: Category | undefined;
      const foundRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: 1,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const countedRestaurant: number = 0;
      const foundCategory = {
        id: 2,
        name: 'fast food',
        imageUrl: '',
        restaurants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      mockRestaurantRepository.count.mockResolvedValue(countedRestaurant);
      mockCategoryRepository.findOne.mockResolvedValue(foundCategory);
      const editRestaurantOutput: EditRestaurantOutput = await restaurantsService.editRestaurant(
        editRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: editRestaurantInput.restaurantId });
      expect(mockRestaurantRepository.count).toBeCalled();
      expect(mockRestaurantRepository.count).toBeCalledWith({ name: editRestaurantInput.name });
      expect(mockCategoryRepository.findOne).toBeCalled();
      expect(mockCategoryRepository.findOne).toBeCalledWith({ name: editRestaurantInput.categoryName });
      expect(mockRestaurantRepository.save).toBeCalled();
      expect(mockRestaurantRepository.save).toBeCalledWith([
        {
          id: editRestaurantInput.restaurantId,
          name: editRestaurantInput.name,
          address: editRestaurantInput.address,
          imageUrl: editRestaurantInput.imageUrl,
          category: foundOrCreatedCategory,
        },
      ]);
      expect(editRestaurantOutput).toEqual({ ok: true, message: '???????????? ????????? ?????????????????????.' });
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.findOne.mockRejectedValue(new Error());
      const editRestaurantOutput: EditRestaurantOutput = await restaurantsService.editRestaurant(
        editRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(editRestaurantOutput).toEqual({ ok: false, message: '???????????? ????????? ?????????????????????.' });
    });
  });

  describe('deleteRestaurant', () => {
    const deleteRestaurantInput: DeleteRestaurantInput = { restaurantId: 1 };

    it('should not delete restaurant if restaurant does not exist', async () => {
      const foundRestaurant = undefined;
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const deleteRestaurantOutput: DeleteRestaurantOutput = await restaurantsService.deleteRestaurant(
        deleteRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: deleteRestaurantInput.restaurantId });
      expect(deleteRestaurantOutput).toEqual({ ok: false, message: '???????????? ?????? ?????????????????????.' });
    });

    it('should not delete restaurant if restaurant owner is not correct', async () => {
      const foundRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: 2,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const deleteRestaurantOutput: DeleteRestaurantOutput = await restaurantsService.deleteRestaurant(
        deleteRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: deleteRestaurantInput.restaurantId });
      expect(deleteRestaurantOutput).toEqual({ ok: false, message: '????????? ??? ?????? ?????????????????????.' });
    });

    it('should delete restaurant if restaurant exist and restaurant owner is correct', async () => {
      const foundRestaurant: Restaurant = {
        id: 1,
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        owner: loggedInUser,
        ownerId: 1,
        dishes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRestaurantRepository.findOne.mockResolvedValue(foundRestaurant);
      const deleteRestaurantOutput: DeleteRestaurantOutput = await restaurantsService.deleteRestaurant(
        deleteRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(mockRestaurantRepository.findOne).toBeCalledWith({ id: deleteRestaurantInput.restaurantId });
      expect(deleteRestaurantOutput).toEqual({ ok: true, message: '???????????? ????????? ?????????????????????.' });
    });

    it('should fail on exception', async () => {
      mockRestaurantRepository.findOne.mockRejectedValue(new Error());
      const deleteRestaurantOutput: DeleteRestaurantOutput = await restaurantsService.deleteRestaurant(
        deleteRestaurantInput,
        loggedInUser,
      );

      expect(mockRestaurantRepository.findOne).toBeCalled();
      expect(deleteRestaurantOutput).toEqual({ ok: false, message: '???????????? ????????? ?????????????????????.' });
    });
  });
});

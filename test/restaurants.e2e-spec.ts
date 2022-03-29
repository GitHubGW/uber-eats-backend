import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { Category } from 'src/categories/entities/category.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

interface Input {
  [key: string]: object;
}

interface Query {
  query: string;
  variables?: object;
}

const GRAPHQL_ENDPOINT: string = '/graphql';
const EMAIL: string = 'user@gmail.com';
const PASSWORD: string = '1234';
const ROLE: string = 'Owner';

describe('RestaurantsModule (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let restaurantsRepository: Repository<Restaurant>;
  let categoryRepository: Repository<Category>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    restaurantsRepository = module.get<Repository<Restaurant>>(getRepositoryToken(Restaurant));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    let createAccountInput: Input = {
      input: {
        email: EMAIL,
        password: PASSWORD,
        role: ROLE,
      },
    };
    const createAccountQuery: Query = {
      query: `
        mutation CreateAccount($input: CreateAccountInput!) {
          createAccount(input: $input) {
            ok
            message
          }
        }
      `,
      variables: createAccountInput,
    };

    it('should create an account if user does not exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(createAccountQuery)
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.createAccount).toEqual({
            ok: true,
            message: '계정 생성에 성공하였습니다.',
          });
        });
    });
  });

  describe('login', () => {
    let loginInput: Input;
    const loginQuery = (loginInput: Input): Query => ({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            ok
            message
            token
          }
        }
      `,
      variables: loginInput,
    });

    it('should login if user exist and password is correct', async () => {
      const [foundUser] = await userRepository.find();
      loginInput = {
        input: {
          email: foundUser.email,
          password: PASSWORD,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(loginQuery(loginInput))
        .expect(200)
        .expect((response: request.Response) => {
          token = response.body.data.login.token;
          expect(response.body.data.login).toEqual({
            ok: true,
            message: '로그인에 성공하였습니다.',
            token: response.body.data.login.token,
          });
        });
    });
  });

  describe('createRestaurant', () => {
    let createRestaurantInput: Input = {
      input: {
        name: 'test restaurant',
        address: 'seoul',
        imageUrl: '',
        categoryName: 'korean food',
      },
    };
    const createRestaurantQuery = (createRestaurantInput: Input): Query => ({
      query: `
        mutation CreateRestaurant($input: CreateRestaurantInput!) {
          createRestaurant(input: $input) {
            ok
            message
          }
        }
      `,
      variables: createRestaurantInput,
    });

    it('should create restaurant and category if restaurant and category does not exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(createRestaurantQuery(createRestaurantInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.createRestaurant).toEqual({ ok: true, message: '레스토랑 생성에 성공하였습니다.' });
        });
    });

    it('should not create restaurant if restaurant already exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(createRestaurantQuery(createRestaurantInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.createRestaurant).toEqual({ ok: false, message: '이미 존재하는 레스토랑입니다.' });
        });
    });
  });

  describe('editRestaurant', () => {
    let editRestaurantInput: Input;
    const editRestaurantQuery = (editRestaurantInput: Input): Query => ({
      query: `
        mutation EditRestaurant($input: EditRestaurantInput!) {
          editRestaurant(input: $input) {
            ok
            message
          }
        }
      `,
      variables: editRestaurantInput,
    });

    it('should not edit restaurant if restaurant does not exist', () => {
      editRestaurantInput = {
        input: {
          restaurantId: 999,
          name: 'test restaurant',
          address: 'seoul',
          imageUrl: '',
          categoryName: 'korean food',
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(editRestaurantQuery(editRestaurantInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.editRestaurant).toEqual({ ok: false, message: '존재하지 않는 레스토랑입니다.' });
        });
    });

    it('should not edit restaurant if restaurant name exist', async () => {
      const [foundRestaurant] = await restaurantsRepository.find();
      editRestaurantInput = {
        input: {
          restaurantId: foundRestaurant.id,
          name: foundRestaurant.name,
          address: foundRestaurant.address,
          imageUrl: foundRestaurant.imageUrl,
          categoryName: foundRestaurant.category,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(editRestaurantQuery(editRestaurantInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.editRestaurant).toEqual({
            ok: false,
            message: '이미 사용 중인 레스토랑 이름입니다.',
          });
        });
    });

    it('should edit restaurant and should create category if restaurant name does not exist and category does not exist', async () => {
      const [foundRestaurant] = await restaurantsRepository.find();
      editRestaurantInput = {
        input: {
          restaurantId: foundRestaurant.id,
          name: 'test restaurant2',
          address: 'seoul',
          imageUrl: '',
          categoryName: 'fast food',
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(editRestaurantQuery(editRestaurantInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.editRestaurant).toEqual({
            ok: true,
            message: '레스토랑 수정에 성공하였습니다.',
          });
        });
    });
  });

  describe('seeAllRestaurants', () => {
    let seeAllRestaurantsInput: Input;
    const seeAllRestaurantsQuery = (seeAllRestaurantsInput: Input): Query => ({
      query: `
        query SeeAllRestaurants($input: SeeAllRestaurantsInput!) {
          seeAllRestaurants(input: $input) {
            ok
            message
            totalPages
            totalRestaurants
            restaurants {
              id
              name
            }
          }
        }
      `,
      variables: seeAllRestaurantsInput,
    });

    it('should see all restaurants if restaurant exist', () => {
      seeAllRestaurantsInput = {
        input: {
          page: 1,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(seeAllRestaurantsQuery(seeAllRestaurantsInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeAllRestaurants).toEqual({
            ok: true,
            message: '전체 레스토랑 보기에 성공하였습니다.',
            totalPages: 1,
            totalRestaurants: 1,
            restaurants: [{ id: 1, name: 'test restaurant2' }],
          });
        });
    });
  });

  describe('seeRestaurant', () => {
    let seeRestaurantInput: Input;
    const seeRestaurantQuery = (seeRestaurantInput: Input): Query => ({
      query: `
        query SeeRestaurant($input: SeeRestaurantInput!) {
          seeRestaurant(input: $input) {
            ok
            message
            restaurant {
              id
              name
            }
          }
        }
      `,
      variables: seeRestaurantInput,
    });

    it('should not see if restaurant does not exist', () => {
      seeRestaurantInput = {
        input: {
          restaurantId: 999,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(seeRestaurantQuery(seeRestaurantInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeRestaurant).toEqual({
            ok: false,
            message: '존재하지 않는 레스토랑입니다.',
            restaurant: null,
          });
        });
    });

    it('should see if restaurant exist', async () => {
      const [foundRestaurant] = await restaurantsRepository.find();
      seeRestaurantInput = {
        input: {
          restaurantId: foundRestaurant.id,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(seeRestaurantQuery(seeRestaurantInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeRestaurant).toEqual({
            ok: true,
            message: '레스토랑 보기에 성공하였습니다.',
            restaurant: { id: 1, name: 'test restaurant2' },
          });
        });
    });
  });

  describe('searchRestaurants', () => {
    let searchRestaurantsInput: Input;
    const searchRestaurantsQuery = (searchRestaurantsInput: Input): Query => ({
      query: `
        query SearchRestaurants($input: SearchRestaurantsInput!) {
          searchRestaurants(input: $input) {
            ok
            message
            totalPages
            totalRestaurants
            restaurants {
              id
              name
            }
          }
        }
      `,
      variables: searchRestaurantsInput,
    });

    it('should search restaurants if restaurant exist', () => {
      searchRestaurantsInput = {
        input: {
          restaurantName: 'test restaurant',
          page: 1,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(searchRestaurantsQuery(searchRestaurantsInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.searchRestaurants).toEqual({
            ok: true,
            message: '레스토랑 검색에 성공하였습니다.',
            totalPages: 1,
            totalRestaurants: 1,
            restaurants: [{ id: 1, name: 'test restaurant2' }],
          });
        });
    });
  });

  describe('deleteRestaurant', () => {
    let deleteRestaurantsInput: Input;
    const deleteRestaurantsQuery = (deleteRestaurantsInput: Input): Query => ({
      query: `
        mutation DeleteRestaurant($input: DeleteRestaurantInput!) {
          deleteRestaurant(input: $input) {
            ok
            message
          }
        }
      `,
      variables: deleteRestaurantsInput,
    });

    it('should not delete restaurant if restaurant does not exist', () => {
      deleteRestaurantsInput = {
        input: {
          restaurantId: 999,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(deleteRestaurantsQuery(deleteRestaurantsInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.deleteRestaurant).toEqual({
            ok: false,
            message: '존재하지 않는 레스토랑입니다.',
          });
        });
    });

    it('should delete restaurant if restaurant exist', async () => {
      const [foundRestaurant] = await restaurantsRepository.find();
      deleteRestaurantsInput = {
        input: {
          restaurantId: foundRestaurant.id,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(deleteRestaurantsQuery(deleteRestaurantsInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.deleteRestaurant).toEqual({
            ok: true,
            message: '레스토랑 삭제에 성공하였습니다.',
          });
        });
    });
  });
});

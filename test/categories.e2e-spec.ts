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

describe('CategoriesModule (e2e)', () => {
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
  });

  describe('seeAllCategories', () => {
    const seeAllCategoriesQuery: Query = {
      query: `
        query SeeAllCategories {
          seeAllCategories {
            ok
            message
            category {
              id
              name
            }
          }
        }
      `,
    };

    it('should see all categories if category exist', async () => {
      const [foundCategories] = await categoryRepository.find();
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(seeAllCategoriesQuery)
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeAllCategories).toEqual({
            ok: true,
            message: '전체 카테고리 보기에 성공하였습니다.',
            category: [{ id: foundCategories.id, name: foundCategories.name }],
          });
        });
    });
  });

  describe('seeCategory', () => {
    let seeCategoryInput: Input;
    const seeCategoryQuery = (seeAllCategoriesInput: Input): Query => ({
      query: `
        query SeeCategory($input: SeeCategoryInput!) {
          seeCategory(input: $input) {
            ok
            message
            totalPages
            totalRestaurants
            category {
              id
              name
            }
          }
        }
      `,
      variables: seeAllCategoriesInput,
    });

    it('should see category if category exist', async () => {
      const [foundCategories] = await categoryRepository.find();
      seeCategoryInput = {
        input: {
          categoryName: 'korean food',
          page: 1,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(seeCategoryQuery(seeCategoryInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeCategory).toEqual({
            ok: true,
            message: '카테고리 보기에 성공하였습니다.',
            totalPages: 1,
            totalRestaurants: 1,
            category: { id: foundCategories.id, name: foundCategories.name },
          });
        });
    });
  });
});

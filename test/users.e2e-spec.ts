import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

interface Input {
  [key: string]: object;
}

interface Query {
  query: string;
  variables: object;
}

const GRAPHQL_ENDPOINT: string = '/graphql';
const EMAIL: string = '@gmail.com';
const PASSWORD: string = '1234';
const ROLE: string = 'Owner';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    let createAccountInput: Input;
    const createAccountQuery = (createAccountInput: Input): Query => ({
      query: `
        mutation CreateAccount($input: CreateAccountInput!) {
          createAccount(input: $input) {
            ok
            message
          }
        }
      `,
      variables: createAccountInput,
    });

    it('should create an account if user does not exist', () => {
      createAccountInput = {
        input: {
          email: EMAIL,
          password: PASSWORD,
          role: ROLE,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(createAccountQuery(createAccountInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.createAccount).toEqual({
            ok: true,
            message: '계정 생성에 성공하였습니다.',
          });
        });
    });

    it('should not create account if user exist', () => {
      createAccountInput = {
        input: {
          email: EMAIL,
          password: PASSWORD,
          role: ROLE,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(createAccountQuery(createAccountInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.createAccount).toEqual({
            ok: false,
            message: '이미 존재하는 계정입니다.',
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

    it('should not login if user does not exist', () => {
      loginInput = {
        input: {
          email: 'nouser@gmail.com',
          password: PASSWORD,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(loginQuery(loginInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.login).toEqual({
            ok: false,
            message: '존재하지 않는 계정입니다.',
            token: null,
          });
        });
    });

    it('should not login if password is not correct', () => {
      loginInput = {
        input: {
          email: EMAIL,
          password: '0000',
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(loginQuery(loginInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.login).toEqual({
            ok: false,
            message: '잘못된 비밀번호입니다.',
            token: null,
          });
        });
    });

    it('should login if user exist and password is correct', () => {
      loginInput = {
        input: {
          email: EMAIL,
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

  describe('seeProfile', () => {
    let seeProfileInput: Input;
    const seeProfileQuery = (seeProfileInput: Input): Query => ({
      query: `
        query SeeProfile($input: SeeProfileInput!) {
          seeProfile(input: $input) {
            ok
            message
            user {
              id
              email
            }
          }
        },
      `,
      variables: seeProfileInput,
    });

    it('should not see profile if user does not exist', () => {
      seeProfileInput = {
        input: {
          id: 999,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(seeProfileQuery(seeProfileInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeProfile).toEqual({
            ok: false,
            message: '존재하지 않는 계정입니다.',
            user: null,
          });
        });
    });

    it('should see profile if user exist', async () => {
      const [foundUser] = await userRepository.find();
      seeProfileInput = {
        input: {
          id: foundUser.id,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(seeProfileQuery(seeProfileInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeProfile).toEqual({
            ok: true,
            message: '프로필 보기에 성공하였습니다.',
            user: { id: foundUser.id, email: EMAIL },
          });
        });
    });
  });

  describe('seeMe', () => {
    it('', () => {});
  });

  describe('editProfile', () => {
    it('', () => {});
  });

  describe('verifyEmail', () => {
    it('', () => {});
  });

  describe('resetPassword', () => {
    it('', () => {});
  });
});

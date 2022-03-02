import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

const GRAPHQL_ENDPOINT = '/graphql';
const EMAIL = 'kowonp@gmail.com';
const PASSWORD = '1234';
const ROLE = 'Owner';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    const createAccountInput = {
      input: {
        email: EMAIL,
        password: PASSWORD,
        role: ROLE,
      },
    };
    const createAccountQuery = {
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
          expect(response.body).toEqual({
            data: { createAccount: { ok: true, message: '계정 생성에 성공하였습니다.' } },
          });
        });
    });

    it('should not create account if user exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(createAccountQuery)
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body).toEqual({
            data: { createAccount: { ok: false, message: '이미 존재하는 계정입니다.' } },
          });
        });
    });
  });

  describe('login', () => {
    const loginInput = {
      input: {
        email: EMAIL,
        password: PASSWORD,
      },
    };
    const loginQuery = {
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
    };

    it('should not login if user does not exist', () => {
      const wrongLoginInput = {
        input: {
          email: 'nouser@gmail.com',
          password: PASSWORD,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                ok
                message
                token
              }
            }
          `,
          variables: wrongLoginInput,
        })
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body).toEqual({
            data: { login: { ok: false, message: '존재하지 않는 계정입니다.', token: null } },
          });
        });
    });

    it('should not login if password is not correct', () => {
      const wrongLoginInput = {
        input: {
          email: EMAIL,
          password: '0000',
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                ok
                message
                token
              }
            }
          `,
          variables: wrongLoginInput,
        })
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body).toEqual({
            data: { login: { ok: false, message: '잘못된 비밀번호입니다.', token: null } },
          });
        });
    });

    it('should login if user exist and password is correct', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(loginQuery)
        .expect(200)
        .expect((response: request.Response) => {
          token = response.body.data.login.token;
          expect(response.body).toEqual({
            data: { login: { ok: true, message: '로그인에 성공하였습니다.', token: response.body.data.login.token } },
          });
        });
    });
  });

  describe('seeMe', () => {
    it('', () => {});
  });

  describe('seeProfile', () => {
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

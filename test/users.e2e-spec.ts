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
        mutation ($input: CreateAccountInput!) {
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
        .expect((response: Response) => {
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
        .expect((response: Response) => {
          expect(response.body).toEqual({
            data: { createAccount: { ok: false, message: '이미 존재하는 계정입니다.' } },
          });
        });
    });
  });

  describe('login', () => {
    it('', () => {});
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

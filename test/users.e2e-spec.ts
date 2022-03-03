import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

interface Input {
  [key: string]: object;
}

interface Query {
  query: string;
  variables?: object;
}

const GRAPHQL_ENDPOINT: string = '/graphql';
const EMAIL: string = '@gmail.com';
const PASSWORD: string = '1234';
const ROLE: string = 'Owner';
const NO_EMAIL: string = 'nouser@gmail.com';
const NO_USER: string = 'nouser';
const NEW_EMAIL: string = 'newuser@gmail.com';
const NEW_USER: string = 'newuser';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
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
        .send(createAccountQuery)
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
          email: NO_EMAIL,
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
    const seeMeQuery: Query = {
      query: `
        query SeeMe {
          seeMe {
            id
            email
          }
        }
      `,
    };

    it('should see me if user is logged in', async () => {
      const [foundUser] = await userRepository.find();

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(seeMeQuery)
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.seeMe).toEqual({
            id: foundUser.id,
            email: EMAIL,
          });
        });
    });

    it('should not see me if user is not logged in', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(seeMeQuery)
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.errors[0].message).toBe('Forbidden resource');
          expect(response.body.data).toBeNull();
        });
    });
  });

  describe('editProfile', () => {
    let editProfileInput: Input;
    const editProfileQuery = (editProfileInput: Input): Query => ({
      query: `
        mutation EditProfile($input: EditProfileInput!) {
          editProfile(input: $input) {
            ok
            message
          }
        }
      `,
      variables: editProfileInput,
    });

    it('should not edit profile if user does not exist', () => {
      editProfileInput = {
        input: {
          email: NO_EMAIL,
          username: NO_USER,
          password: PASSWORD,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(editProfileQuery(editProfileInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.errors[0].message).toBe('Forbidden resource');
          expect(response.body.data).toBeNull();
        });
    });

    it('should not edit profile if email exist', () => {
      editProfileInput = {
        input: {
          email: EMAIL,
          username: NEW_USER,
          password: PASSWORD,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(editProfileQuery(editProfileInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.editProfile).toEqual({ ok: false, message: '이미 사용 중인 이메일입니다.' });
        });
    });

    it('should edit profile if user exist and email does not exist', () => {
      editProfileInput = {
        input: {
          email: NEW_EMAIL,
          username: NEW_USER,
          password: PASSWORD,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(editProfileQuery(editProfileInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.editProfile).toEqual({ ok: true, message: '프로필 수정에 성공하였습니다.' });
        });
    });
  });

  describe('verifyEmail', () => {
    let verifyEmailInput: Input;
    const verifyEmailQuery = (verifyEmailInput: Input): Query => ({
      query: `
        mutation VerifyEmail($input: VerifyEmailInput!) {
          verifyEmail(input: $input) {
            ok
            message
          }
        }
      `,
      variables: verifyEmailInput,
    });

    it('should not verify email if verification code does not exist', () => {
      verifyEmailInput = {
        input: {
          code: 'null',
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(verifyEmailQuery(verifyEmailInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.verifyEmail).toEqual({ ok: false, message: '존재하지 않는 인증 코드입니다.' });
        });
    });

    it('should verify email if verification code exist', async () => {
      const [foundVerification] = await verificationRepository.find();
      verifyEmailInput = {
        input: {
          code: foundVerification.code,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send(verifyEmailQuery(verifyEmailInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.verifyEmail).toEqual({ ok: true, message: '이메일 인증에 성공하였습니다.' });
        });
    });
  });

  describe('resetPassword', () => {
    let resetPasswordInput: Input;
    const resetPasswordQuery = (resetPasswordInput: Input): Query => ({
      query: `
        mutation ResetPassword($input: ResetPasswordInput!) {
          resetPassword(input: $input) {
            ok
            message
          }
        }
      `,
      variables: resetPasswordInput,
    });

    it('should not reset password if user does not exist', () => {
      resetPasswordInput = {
        input: {
          username: NO_USER,
          password: PASSWORD,
          confirmPassword: PASSWORD,
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(resetPasswordQuery(resetPasswordInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.resetPassword).toEqual({
            ok: false,
            message: '존재하지 않는 계정입니다.',
          });
        });
    });

    it('should not reset password if password is not correct', () => {
      resetPasswordInput = {
        input: {
          username: NEW_USER,
          password: '12345',
          confirmPassword: '123456',
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(resetPasswordQuery(resetPasswordInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.resetPassword).toEqual({
            ok: false,
            message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
          });
        });
    });

    it('should reset password if user exist and password is correct', async () => {
      const [foundUser] = await userRepository.find();
      resetPasswordInput = {
        input: {
          username: foundUser.username,
          password: '12345',
          confirmPassword: '12345',
        },
      };

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('token', token)
        .send(resetPasswordQuery(resetPasswordInput))
        .expect(200)
        .expect((response: request.Response) => {
          expect(response.body.data.resetPassword).toEqual({
            ok: true,
            message: '비밀번호 재설정에 성공하였습니다.',
          });
        });
    });
  });
});

import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './enums/role.enum';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from './users.service';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { CreateAccountInput, CreateAccountOutput } from './dtos/createAccount.dto';
import { SeeProfileInput, SeeProfileOutput } from './dtos/seeProfile.dto';
import { ResetPasswordInput, ResetPasswordOutput } from './dtos/resetPassword.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verifyEmail.dto';

jest.mock('bcrypt');

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
};

const mockVerificationRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockJwtService = {
  signToken: jest.fn(() => 'Test Token'),
  verifyToken: jest.fn(),
};

const mockMailService = {
  sendEmailVerification: jest.fn(),
  sendBilling: jest.fn(),
  sendPasswordReset: jest.fn(),
};

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Verification), useValue: mockVerificationRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('seeMe', () => {
    it('should see me', () => {
      const loggedInUser: User = {
        id: 1,
        email: 'user@gmail.com',
        username: 'user',
        password: '1234',
        role: Role.Customer,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        async hashPassword() {},
      };
      const seeMeOutput = usersService.seeMe(loggedInUser);

      expect(seeMeOutput).toEqual(loggedInUser);
    });
  });

  describe('seeProfile', () => {
    const seeProfileInput: SeeProfileInput = { id: 1 };

    it('should not see profile if user does not exist', async () => {
      const foundUser = undefined;
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const seeProfileOutput: SeeProfileOutput = await usersService.seeProfile(seeProfileInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(seeProfileOutput).toEqual({ ok: false, message: '존재하지 않는 계정입니다.' });
    });

    it('should see profile if user exist', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com' };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const seeProfileOutput: SeeProfileOutput = await usersService.seeProfile(seeProfileInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(seeProfileOutput).toEqual({ ok: true, message: '프로필 보기에 성공하였습니다.', user: foundUser });
    });

    it('should fail on exception', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error());
      const seeProfileOutput: SeeProfileOutput = await usersService.seeProfile(seeProfileInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(seeProfileOutput).toEqual({ ok: false, message: '프로필 보기에 실패하였습니다.' });
    });
  });

  describe('createAccount', () => {
    const createAccountInput: CreateAccountInput = { email: 'user@gmail.com', password: '1234', role: Role.Customer };

    it('should not create account if user exist', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com' };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const createAccountOutput: CreateAccountOutput = await usersService.createAccount(createAccountInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(createAccountOutput).toEqual({ ok: false, message: '이미 존재하는 계정입니다.' });
    });

    it('should create an account if user does not exist', async () => {
      const foundUser = undefined;
      const createdUser = { id: 1, email: 'user@gmail.com', username: 'user', password: '1234', role: Role.Customer };
      const savedUser = { id: 1, email: 'user@gmail.com', username: 'user', password: '1234', role: Role.Customer };
      const createdVerification = { id: 1, code: 'abcd', user: createdUser };
      const savedVerification = { id: 1, code: 'abcd', user: createdUser };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockVerificationRepository.create.mockResolvedValue(createdVerification);
      mockVerificationRepository.save.mockResolvedValue(savedVerification);
      const createAccountOutput: CreateAccountOutput = await usersService.createAccount(createAccountInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(mockUserRepository.create).toBeCalled();
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.any(Object));
      expect(mockUserRepository.save).toBeCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
      expect(mockVerificationRepository.create).toBeCalled();
      expect(mockVerificationRepository.create).toHaveBeenCalledWith({ user: createdUser });
      expect(mockVerificationRepository.save).toBeCalled();
      expect(mockVerificationRepository.save).toHaveBeenCalledWith(createdVerification);
      expect(mockMailService.sendEmailVerification).toBeCalled();
      expect(mockMailService.sendEmailVerification).toHaveBeenCalledWith(
        createdUser.email,
        createdUser.username,
        createdVerification.code,
      );
      expect(createAccountOutput).toEqual({ ok: true, message: '계정 생성에 성공하였습니다.' });
    });

    it('should fail on exception', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error());
      const createAccountOutput: CreateAccountOutput = await usersService.createAccount(createAccountInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(createAccountOutput).toEqual({ ok: false, message: '계정 생성에 실패하였습니다.' });
    });
  });

  describe('login', () => {
    const loginInput: LoginInput = { email: 'user@gmail.com', password: '1234' };

    it('should not login if user does not exist', async () => {
      const foundUser = undefined;
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const loginOutput: LoginOutput = await usersService.login(loginInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      expect(loginOutput).toEqual({ ok: false, message: '존재하지 않는 계정입니다.' });
    });

    it('should not login if password is not correct', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com', password: '1234' };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
      const loginOutput: LoginOutput = await usersService.login(loginInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      expect(bcrypt.compare).toBeCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(expect.any(String), expect.any(String));
      expect(loginOutput).toEqual({ ok: false, message: '잘못된 비밀번호입니다.' });
    });

    it('should login if user exist and password is correct', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com', password: '1234' };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      const token: string = mockJwtService.signToken();
      const loginOutput: LoginOutput = await usersService.login(loginInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      expect(bcrypt.compare).toBeCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(loginInput.password, foundUser.password);
      expect(mockJwtService.signToken).toBeCalled();
      expect(mockJwtService.signToken).toHaveBeenCalledWith({ id: foundUser.id });
      expect(loginOutput).toEqual({ ok: true, message: '로그인에 성공하였습니다.', token });
    });

    it('should fail on exception', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error());
      const loginOutput: LoginOutput = await usersService.login(loginInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(loginOutput).toEqual({ ok: false, message: '로그인에 실패하였습니다.' });
    });
  });

  describe('editProfile', () => {
    const editProfileInput: EditProfileInput = { email: 'user2@gmail.com', username: 'user', password: '1234' };
    const loggedInUser: User = {
      id: 1,
      email: 'user@gmail.com',
      username: 'user',
      password: '1234',
      role: Role.Customer,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async hashPassword() {},
    };

    it('should not edit profile if user does not exist', async () => {
      const foundUser = undefined;
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const editProfileOutput: EditProfileOutput = await usersService.editProfile(editProfileInput, loggedInUser);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(loggedInUser.id);
      expect(editProfileOutput).toEqual({ ok: false, message: '존재하지 않는 계정입니다.' });
    });

    it('should not edit profile if email exist', async () => {
      const foundUser = { email: 'user@gmail.com', username: 'user', password: '1234' };
      const countedUser = 1;
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      mockUserRepository.count.mockResolvedValue(countedUser);
      const editProfileOutput: EditProfileOutput = await usersService.editProfile(editProfileInput, loggedInUser);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(loggedInUser.id);
      expect(mockUserRepository.count).toBeCalled();
      expect(mockUserRepository.count).toHaveBeenCalledWith({ email: editProfileInput.email });
      expect(editProfileOutput).toEqual({ ok: false, message: '이미 사용 중인 이메일입니다.' });
    });

    it('should edit profile if user exist', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com', username: 'user', password: '1234', role: Role.Customer };
      const countedUser = 0;
      const createdVerification = { id: 1, code: 'abcd', user: foundUser };
      const savedVerification = { id: 1, code: 'abcd', user: foundUser };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      mockUserRepository.count.mockResolvedValue(countedUser);
      mockVerificationRepository.create.mockResolvedValue(createdVerification);
      mockVerificationRepository.save.mockResolvedValue(savedVerification);
      const editProfileOutput: EditProfileOutput = await usersService.editProfile(editProfileInput, loggedInUser);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(loggedInUser.id);
      expect(mockUserRepository.count).toBeCalled();
      expect(mockUserRepository.count).toHaveBeenCalledWith({ email: editProfileInput.email });
      expect(mockVerificationRepository.create).toBeCalled();
      expect(mockVerificationRepository.create).toHaveBeenCalledWith({ user: foundUser });
      expect(mockVerificationRepository.save).toBeCalled();
      expect(mockVerificationRepository.save).toHaveBeenCalledWith(createdVerification);
      expect(mockMailService.sendEmailVerification).toBeCalled();
      expect(mockMailService.sendEmailVerification).toHaveBeenCalledWith(
        foundUser.email,
        foundUser.username,
        createdVerification.code,
      );
      expect(mockUserRepository.save).toBeCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(foundUser);
      expect(editProfileOutput).toEqual({ ok: true, message: '프로필 수정에 성공하였습니다.' });
    });

    it('should fail on exception', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error());
      const editProfileOutput: EditProfileOutput = await usersService.editProfile(editProfileInput, loggedInUser);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(editProfileOutput).toEqual({ ok: false, message: '프로필 수정에 실패하였습니다.' });
    });
  });

  describe('verifyEmail', () => {
    const verifyEmailInput: VerifyEmailInput = { code: 'abcd' };

    it('should not verify email if verification code does not exist', async () => {
      const foundVerification = undefined;
      mockVerificationRepository.findOne.mockResolvedValue(foundVerification);
      const verifyEmailOutput: VerifyEmailOutput = await usersService.verifyEmail(verifyEmailInput);

      expect(mockVerificationRepository.findOne).toBeCalled();
      expect(mockVerificationRepository.findOne).toHaveBeenCalledWith(
        { code: verifyEmailInput.code },
        { relations: ['user'] },
      );
      expect(verifyEmailOutput).toEqual({ ok: false, message: '존재하지 않는 인증 코드입니다.' });
    });

    it('should verify email if verification code exist', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com', username: 'user', password: '1234', emailVerified: false };
      const foundVerification = { id: 1, code: 'abcd', user: foundUser };
      mockVerificationRepository.findOne.mockResolvedValue(foundVerification);
      const verifyEmailOutput: VerifyEmailOutput = await usersService.verifyEmail(verifyEmailInput);

      expect(mockVerificationRepository.findOne).toBeCalled();
      expect(mockVerificationRepository.findOne).toHaveBeenCalledWith(
        { code: verifyEmailInput.code },
        { relations: ['user'] },
      );
      expect(mockUserRepository.update).toBeCalled();
      expect(mockUserRepository.update).toHaveBeenCalledWith(foundVerification.user.id, { emailVerified: true });
      expect(mockVerificationRepository.delete).toBeCalled();
      expect(mockVerificationRepository.delete).toHaveBeenCalledWith({ id: foundVerification.id });
      expect(verifyEmailOutput).toEqual({ ok: true, message: '이메일 인증에 성공하였습니다.' });
    });

    it('should fail on exception', async () => {
      mockVerificationRepository.findOne.mockRejectedValue(new Error());
      const verifyEmailOutput: VerifyEmailOutput = await usersService.verifyEmail(verifyEmailInput);

      expect(mockVerificationRepository.findOne).toBeCalled();
      expect(verifyEmailOutput).toEqual({ ok: false, message: '이메일 인증에 실패하였습니다.' });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordInput: ResetPasswordInput = { username: 'user', password: '1234', confirmPassword: '1234' };
    const wrongResetPasswordInput: ResetPasswordInput = {
      username: 'user',
      password: '1234',
      confirmPassword: '12345',
    };

    it('should not reset password if user does not exist', async () => {
      const foundUser = undefined;
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const resetPasswordOutput: ResetPasswordOutput = await usersService.resetPassword(resetPasswordInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ username: resetPasswordInput.username });
      expect(resetPasswordOutput).toEqual({ ok: false, message: '존재하지 않는 계정입니다.' });
    });

    it('should not reset password if password is not correct', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com', password: '1234' };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const resetPasswordOutput: ResetPasswordOutput = await usersService.resetPassword(wrongResetPasswordInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ username: resetPasswordInput.username });
      expect(resetPasswordOutput).toEqual({ ok: false, message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
    });

    it('should reset password if user exist and password is correct', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com', password: '1234' };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const resetPasswordOutput: ResetPasswordOutput = await usersService.resetPassword(resetPasswordInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ username: resetPasswordInput.username });
      expect(mockUserRepository.save).toBeCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(foundUser);
      expect(resetPasswordOutput).toEqual({ ok: true, message: '비밀번호 재설정에 성공하였습니다.' });
    });

    it('should fail on exception', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error());
      const resetPasswordOutput: ResetPasswordOutput = await usersService.resetPassword(resetPasswordInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(resetPasswordOutput).toEqual({ ok: false, message: '비밀번호 재설정에 실패하였습니다.' });
    });
  });
});

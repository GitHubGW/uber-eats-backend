import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { CreateAccountInput, CreateAccountOutput } from './dtos/createAccount.dto';
import { SeeProfileInput, SeeProfileOutput } from './dtos/seeProfile.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { Role } from './enums/role.enum';
import { UsersService } from './users.service';

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockVerificationRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockJwtService = {
  signToken: jest.fn(),
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
      const loggedInUser = {
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
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(seeProfileOutput).toEqual({ ok: false, message: '존재하지 않는 계정입니다.' });
    });

    it('should see profile if user exist', async () => {
      const foundUser = { id: 1, email: 'user@gmail.com' };
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      const seeProfileOutput: SeeProfileOutput = await usersService.seeProfile(seeProfileInput);

      expect(mockUserRepository.findOne).toBeCalled();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ id: 1 });
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
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: 'user@gmail.com' });
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
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ email: 'user@gmail.com' });
      expect(mockUserRepository.create).toBeCalled();
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'user@gmail.com',
        username: 'user',
        password: '1234',
        role: Role.Customer,
      });
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

  describe('login', () => {});

  describe('editProfile', () => {});

  describe('verifyEmail', () => {});

  describe('resetPassword', () => {});
});

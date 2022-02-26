import * as jwt from 'jsonwebtoken';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';

const JWT_TOKEN = 'JWT_TOKEN';
const JWT_SECRET_KEY = "'JWT_SECRET_KEY'";

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => JWT_TOKEN),
  };
});

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService, { provide: 'jwtOptions', useValue: { jwtSecretKey: JWT_SECRET_KEY } }],
    }).compile();

    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  describe('signToken', () => {
    const payload = { id: 1 };

    it('should sign token', async () => {
      const token: string = await jwtService.signToken(payload);

      expect(jwt.sign).toBeCalled();
      expect(jwt.sign).toHaveBeenCalledWith(payload, JWT_SECRET_KEY);
      expect(typeof token).toBe('string');
      expect(token).toBe(JWT_TOKEN);
    });

    it('should fail on exception', async () => {});
  });

  describe('verifyToken', () => {
    it('should verify token', async () => {});

    it('should fail on exception', () => {});
  });
});

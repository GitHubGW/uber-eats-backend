import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MailService } from './mail.service';

const MAILGUN_API_KEY = 'MAILGUN_API_KEY';
const MAILGUN_DOMAIN_NAME = 'MAILGUN_DOMAIN_NAME';

jest.mock('mailgun.js');
jest.mock('form-data');

const mockUserRepository = {};

describe('MailService', () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: 'mailOptions',
          useValue: { mailgunApiKey: MAILGUN_API_KEY, mailgunDomainName: MAILGUN_DOMAIN_NAME },
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    mailService = module.get(MailService);
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
  });

  describe('sendEmailVerification', () => {
    const sendEmailVerificationInput = { to: 'user@gmail.com', username: 'user', code: 'abcd' };

    it('should send email verification if to, username, code exist', async () => {
      const spyMailgunClient = jest.spyOn(Mailgun.prototype, 'client');
      const sendEmailVerificationOutput = await mailService.sendEmailVerification(
        sendEmailVerificationInput.to,
        sendEmailVerificationInput.username,
        sendEmailVerificationInput.code,
      );

      expect(spyMailgunClient).toHaveBeenCalledTimes(1);
      expect(spyMailgunClient).toHaveBeenCalledWith({ username: 'Uber Eats', key: MAILGUN_API_KEY });
    });
  });

  describe('sendBilling', () => {
    it('should send billing if to, username, restaurant, orderDate, orderId exist', async () => {});
  });

  describe('sendPasswordReset', () => {
    it('should send password reset if email exist', async () => {});
  });
});

import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { Inject, Injectable } from '@nestjs/common';
import { MailData, MailOptions, MailResponse } from './interfaces/mail.interface';
import { SendPasswordResetInput, SendPasswordResetOutput } from './dtos/sendPasswordReset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
  constructor(
    @Inject('mailOptions') private readonly mailOptions: MailOptions,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async sendEmailVerification(to: string, username: string, code: string): Promise<void> {
    try {
      const mailgun: Mailgun = new Mailgun(formData);
      const client = mailgun.client({ username: 'Uber Eats', key: this.mailOptions.mailgunApiKey });
      const mailData: MailData = {
        from: 'Uber Eats <ubereats@mailgun-test.com>',
        to,
        subject: 'Uber Eats',
        template: 'uber-eats-email-verification',
        'v:username': username,
        'v:code': code,
      };
      const mailResponse: MailResponse = await client.messages.create(this.mailOptions.mailgunDomainName, mailData);
      console.log('response', mailResponse);
    } catch (error) {
      console.log('sendEmailVerification error');
    }
  }

  async sendBilling(
    to: string,
    username: string,
    restaurant: string,
    orderDate: string,
    orderId: string,
  ): Promise<void> {
    try {
      const mailgun: Mailgun = new Mailgun(formData);
      const client = mailgun.client({ username: 'Uber Eats', key: this.mailOptions.mailgunApiKey });
      const mailData: MailData = {
        from: 'Uber Eats <ubereats@mailgun-test.com>',
        to,
        subject: 'Uber Eats',
        template: 'uber-eats-billing',
        'v:username': username,
        'v:restaurant': restaurant,
        'v:orderDate': orderDate,
        'v:orderId': orderId,
      };
      const mailResponse: MailResponse = await client.messages.create(this.mailOptions.mailgunDomainName, mailData);
      console.log('response', mailResponse);
    } catch (error) {
      console.log('sendBilling error');
    }
  }

  async sendPasswordReset({ email }: SendPasswordResetInput): Promise<SendPasswordResetOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne({ email });

      if (foundUser === undefined) {
        return { ok: false, message: '존재하지 않는 계정입니다.' };
      }

      const mailgun: Mailgun = new Mailgun(formData);
      const client = mailgun.client({ username: 'Uber Eats', key: this.mailOptions.mailgunApiKey });
      const mailData: MailData = {
        from: 'Uber Eats <ubereats@mailgun-test.com>',
        to: email,
        subject: 'Uber Eats',
        template: 'uber-eats-password-reset',
        'v:username': email.split('@')[0],
      };
      const mailResponse: MailResponse = await client.messages.create(this.mailOptions.mailgunDomainName, mailData);
      console.log('response', mailResponse);
      return { ok: true, message: '비밀번호 재설정 메일 전송을 성공하였습니다.' };
    } catch (error) {
      console.log('sendPasswordReset error');
      return { ok: false, message: '비밀번호 재설정 메일 전송을 실패하였습니다.' };
    }
  }
}

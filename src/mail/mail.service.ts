import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { Inject, Injectable } from '@nestjs/common';
import { MailData, MailOptions, MailResponse } from './interfaces/mail.interface';

@Injectable()
export class MailService {
  constructor(@Inject('mailOptions') private readonly mailOptions: MailOptions) {
    // this.handleSendEmail();
  }

  async handleSendEmail(): Promise<void> {
    try {
      const mailgun: Mailgun = new Mailgun(formData);
      const client = mailgun.client({ username: 'Uber Eats', key: this.mailOptions.mailgunApiKey });
      const mailData: MailData = {
        from: 'GW <gw@mailgun-test.com>',
        to: 'kowonp@gmail.com',
        subject: 'Hello',
        template: 'uber-eats-email-verification',
        'v:username': 'sugar',
        'v:code': 'AB12',
      };
      const mailResponse: MailResponse = await client.messages.create(this.mailOptions.mailgunDomainName, mailData);
      console.log('response', mailResponse);
    } catch (error) {
      console.log('handleSendEmail error');
    }
  }
}

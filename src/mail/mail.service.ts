import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { MailOptions } from './interfaces/mailOptions.interface';

@Injectable()
export class MailService {
  constructor(@Inject('mailOptions') private readonly mailOptions: MailOptions) {
    this.handleSendEmail();
  }

  async handleSendEmail(): Promise<void> {
    try {
      const formData: FormData = new FormData();
      formData.append('from', `GW <gw@mailgun-test.com>`);
      formData.append('to', 'kowonp@gmail.com');
      formData.append('subject', 'Hello');
      formData.append('text', 'Testing som Mailgun awesomeness!');

      const newBuffer: Buffer = Buffer.from(`api:${this.mailOptions.mailgunApiKey}`);
      const toStringBuffer: string = newBuffer.toString('base64');
      const authorizationValue: string = `Basic ${toStringBuffer}`;

      console.log('form', formData);
      console.log('authorizationValue', authorizationValue);

      const response = await got.post(`https://api.mailgun.net/v3/${this.mailOptions.mailgunDomainName}/messages`, {
        headers: { authorization: authorizationValue },
        body: formData,
      });

      console.log('response', response.body);
    } catch (error) {
      console.log('handleSendEmail error');
    }
  }
}

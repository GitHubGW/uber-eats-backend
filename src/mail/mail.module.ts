import { DynamicModule, Global, Module } from '@nestjs/common';
import { MailOptions } from './interfaces/mail.interface';
import { MailService } from './mail.service';

@Global()
@Module({})
export class MailModule {
  static forRoot(mailOptions: MailOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [MailService, { provide: 'mailOptions', useValue: mailOptions }],
      exports: [MailService],
    };
  }
}

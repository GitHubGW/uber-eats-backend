import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { MailService } from './mail.service';
import { MailResolver } from './mail.resolver';
import { MailOptions } from './interfaces/mail.interface';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [MailResolver],
})
export class MailModule {
  static forRoot(mailOptions: MailOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [MailService, { provide: 'mailOptions', useValue: mailOptions }],
      exports: [MailService],
    };
  }
}

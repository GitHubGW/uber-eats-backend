import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SendPasswordResetInput, SendPasswordResetOutput } from './dtos/sendPasswordReset.dto';
import { MailService } from './mail.service';

@Resolver()
export class MailResolver {
  constructor(private readonly mailService: MailService) {}

  @Mutation((returns) => SendPasswordResetOutput)
  sendPasswordReset(@Args('input') sendPasswordResetInput: SendPasswordResetInput): Promise<SendPasswordResetOutput> {
    return this.mailService.sendPasswordReset(sendPasswordResetInput);
  }
}

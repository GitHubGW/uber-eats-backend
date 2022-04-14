import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/createPayment.dto';
import { SeePaymentsOutput } from './dtos/seePayments.dto';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Resolver((of) => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles([Role.Customer])
  @Query((returns) => SeePaymentsOutput)
  seePayments(@Context('loggedInUser') loggedInUser: User): Promise<SeePaymentsOutput> {
    return this.paymentsService.seePayments(loggedInUser);
  }

  @Roles([Role.Owner])
  @Mutation((returns) => CreatePaymentOutput)
  createPayment(
    @Args('input') createPaymentInput: CreatePaymentInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<CreatePaymentOutput> {
    return this.paymentsService.createPayment(createPaymentInput, loggedInUser);
  }
}

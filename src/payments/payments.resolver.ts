import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/createPayment.dto';
import { SeeAllPaymentsOutput } from './dtos/seeAllPayments.dto';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Resolver((of) => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles([Role.Owner])
  @Query((returns) => SeeAllPaymentsOutput)
  seeAllPayments(@Context('loggedInUser') loggedInUser: User): Promise<SeeAllPaymentsOutput> {
    return this.paymentsService.seeAllPayments(loggedInUser);
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

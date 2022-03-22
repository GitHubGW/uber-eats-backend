import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { CreateOrderInput, CreateOrderOutput } from './dtos/createOrder.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Resolver((of) => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles([Role.Customer])
  @Mutation((returns) => CreateOrderOutput)
  createOrder(
    @Args('input') createOrderInput: CreateOrderInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(createOrderInput, loggedInUser);
  }
}

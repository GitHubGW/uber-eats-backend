import { Inject } from '@nestjs/common';
import { Args, Context, Query, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Roles } from 'src/auth/roles.decorator';
import { NEW_PENDING_ORDER, PUB_SUB } from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { CreateOrderInput, CreateOrderOutput } from './dtos/createOrder.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/editOrder.dto';
import { SeeAllOrdersInput, SeeAllOrdersOutput } from './dtos/seeAllOrders.dto';
import { SeeOrderInput, SeeOrderOutput } from './dtos/seeOrder.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Resolver((of) => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService, @Inject(PUB_SUB) private readonly pubsub: PubSub) {}

  @Roles([Role.Any])
  @Query((returns) => SeeAllOrdersOutput)
  seeAllOrders(
    @Args('input') seeAllOrdersInput: SeeAllOrdersInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<SeeAllOrdersOutput> {
    return this.ordersService.seeAllOrders(seeAllOrdersInput, loggedInUser);
  }

  @Roles([Role.Any])
  @Query((returns) => SeeOrderOutput)
  seeOrder(
    @Args('input') seeOrderInput: SeeOrderInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<SeeOrderOutput> {
    return this.ordersService.seeOrder(seeOrderInput, loggedInUser);
  }

  @Roles([Role.Customer])
  @Mutation((returns) => CreateOrderOutput)
  createOrder(
    @Args('input') createOrderInput: CreateOrderInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(createOrderInput, loggedInUser);
  }

  @Roles([Role.Owner, Role.Driver])
  @Mutation((returns) => EditOrderOutput)
  editOrder(
    @Args('input') editOrderInput: EditOrderInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(editOrderInput, loggedInUser);
  }

  @Roles([Role.Owner])
  @Subscription((returns) => Order, {
    filter: (payload: any, variables: any, context: any): boolean => {
      if (payload.pendingOrder.ownerId === context.loggedInUser.id) {
        return true;
      }
      return false;
    },
    resolve: (payload: any, args: any, context: any, info: any): Order => {
      const createdOrder: Order = payload.pendingOrder.order;
      return createdOrder;
    },
  })
  pendingOrder() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }
}

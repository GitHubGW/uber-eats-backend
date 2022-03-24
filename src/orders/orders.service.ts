import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish, DishOption } from 'src/dishes/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/createOrder.dto';
import { SeeAllOrdersInput, SeeAllOrdersOutput } from './dtos/seeAllOrders.dto';
import { SeeOrderInput, SeeOrderOutput } from './dtos/seeOrder.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(Dish) private readonly dishesRepository: Repository<Dish>,
  ) {}

  async seeAllOrders({ status }: SeeAllOrdersInput, loggedInUser: User): Promise<SeeAllOrdersOutput> {
    try {
      let foundAllOrders: Order[] = [];

      switch (loggedInUser.role) {
        case Role.Owner:
          const foundRestaurants: Restaurant[] = await this.restaurantsRepository.find({
            where: { owner: loggedInUser },
            relations: ['restaurantOrders'],
          });
          foundAllOrders = foundRestaurants.map((restaurant: Restaurant) => restaurant.restaurantOrders).flat();

          if (status) {
            foundAllOrders = foundAllOrders.filter((foundOrder: Order) => foundOrder.status === status);
          }
          break;
        case Role.Customer:
          foundAllOrders = await this.ordersRepository.find({ customer: loggedInUser, ...(status && { status }) });
          break;
        case Role.Driver:
          foundAllOrders = await this.ordersRepository.find({ driver: loggedInUser, ...(status && { status }) });
          break;
        default:
          throw new Error();
      }

      return { ok: true, message: '전체 주문 보기에 성공하였습니다.', orders: foundAllOrders };
    } catch (error) {
      console.log('seeAllOrders error');
      return { ok: false, message: '전체 주문 보기에 실패하였습니다.' };
    }
  }

  async seeOrder({ id }: SeeOrderInput, loggedInUser: User): Promise<SeeOrderOutput> {
    try {
      const foundOrder: Order | undefined = await this.ordersRepository.findOne({ id }, { relations: ['restaurant'] });

      if (foundOrder === undefined) {
        return { ok: false, message: '존재하지 않는 주문입니다.' };
      }
      if (loggedInUser.role === Role.Owner && foundOrder.restaurant.ownerId !== loggedInUser.id) {
        throw new Error();
      } else if (loggedInUser.role === Role.Customer && foundOrder.customerId !== loggedInUser.id) {
        throw new Error();
      } else if (loggedInUser.role === Role.Driver && foundOrder.driverId !== loggedInUser.id) {
        throw new Error();
      }

      return { ok: true, message: '주문 보기에 성공하였습니다.', order: foundOrder };
    } catch (error) {
      console.log('seeOrder error');
      return { ok: false, message: '주문 보기에 실패하였습니다.' };
    }
  }

  async createOrder({ restaurantId, items }: CreateOrderInput, loggedInUser: User): Promise<CreateOrderOutput> {
    try {
      let totalOrderPrice: number = 0;
      let orderItemArray: OrderItem[] = [];
      const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne({ id: restaurantId });

      if (foundRestaurant === undefined) {
        return { ok: false, message: '존재하지 않는 레스토랑입니다.' };
      }
      if (foundRestaurant.ownerId === loggedInUser.id) {
        return { ok: false, message: '주문을 생성할 수 없는 레스토랑입니다.' };
      }

      for (const item of items) {
        let dishOptionPrice: number = 0;
        const foundDish: Dish | undefined = await this.dishesRepository.findOne({ id: item.dishId });

        if (foundDish === undefined) {
          return { ok: false, message: '존재하지 않는 음식입니다.' };
        }

        for (const itemDishOption of item.dishOptions) {
          const foundDishOption: DishOption | undefined = foundDish.dishOptions.find(
            (dishOption) => dishOption.name === itemDishOption.name,
          );

          if (foundDishOption === undefined) {
            return { ok: false, message: '존재하지 않는 음식 옵션입니다.' };
          }

          dishOptionPrice = dishOptionPrice + foundDishOption.price;
        }

        totalOrderPrice = totalOrderPrice + dishOptionPrice;
        const createdOrderItem: OrderItem = this.orderItemsRepository.create({
          dish: foundDish,
          dishOptions: item.dishOptions,
        });
        const savedOrderItem: OrderItem = await this.orderItemsRepository.save(createdOrderItem);
        orderItemArray.push(savedOrderItem);
      }

      const createdOrder: Order = this.ordersRepository.create({
        restaurant: foundRestaurant,
        customer: loggedInUser,
        orderItems: orderItemArray,
        totalPrice: totalOrderPrice,
      });
      await this.ordersRepository.save(createdOrder);
      return { ok: true, message: '주문 생성에 성공하였습니다.' };
    } catch (error) {
      console.log('createOrder error');
      return { ok: false, message: '주문 생성에 실패하였습니다.' };
    }
  }
}

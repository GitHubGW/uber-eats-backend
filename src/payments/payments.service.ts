import { Injectable } from '@nestjs/common';
import { Cron, Interval, Timeout, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/createPayment.dto';
import { SeeAllPaymentsOutput } from './dtos/seeAllPayments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async seeAllPayments(loggedInUser: User): Promise<SeeAllPaymentsOutput> {
    try {
      const foundAllPayments: Payment[] = await this.paymentRepository.find({ user: loggedInUser });
      if (foundAllPayments.length === 0) {
        return { ok: false, message: '홍보 중인 레스토랑 결제가 존재하지 않습니다.' };
      }
      return { ok: true, message: '홍보 중인 레스토랑 결제 보기에 성공하였습니다.', payments: foundAllPayments };
    } catch (error) {
      console.log('seePayments error');
      return { ok: false, message: '홍보 중인 레스토랑 결제 보기에 실패하였습니다.' };
    }
  }

  async createPayment(
    { transactionId, restaurantId }: CreatePaymentInput,
    loggedInUser: User,
  ): Promise<CreatePaymentOutput> {
    try {
      const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne({ id: restaurantId });
      if (foundRestaurant === undefined) {
        return { ok: false, message: '존재하지 않는 레스토랑입니다.' };
      }
      if (foundRestaurant.ownerId !== loggedInUser.id) {
        return { ok: false, message: '접근할 수 없는 레스토랑입니다.' };
      }

      const createdPayment: Payment = await this.paymentRepository.create({
        transactionId,
        restaurant: foundRestaurant,
        user: loggedInUser,
      });
      await this.paymentRepository.save(createdPayment);

      const date: Date = new Date();
      date.setDate(date.getDate() + 7);
      foundRestaurant.promotedUntilDate = date;
      foundRestaurant.isPromoted = true;
      await this.restaurantsRepository.save(foundRestaurant);

      return { ok: true, message: '레스토랑 홍보 결제에 성공하였습니다.' };
    } catch (error) {
      console.log('createPayment error');
      return { ok: false, message: '레스토랑 홍보 결제에 실패하였습니다.' };
    }
  }

  @Interval(10000)
  async checkPromotedRestaurants(): Promise<CommonOutput> {
    try {
      const foundRestaurants: Restaurant[] = await this.restaurantsRepository.find({
        isPromoted: true,
        promotedUntilDate: LessThan(new Date()),
      });
      if (foundRestaurants.length === 0) {
        return { ok: false, message: '홍보가 끝난 레스토랑이 존재하지 않습니다.' };
      }

      foundRestaurants.forEach(async (foundRestaurant: Restaurant) => {
        foundRestaurant.isPromoted = false;
        foundRestaurant.promotedUntilDate = null;
        await this.restaurantsRepository.save(foundRestaurant);
      });
      return { ok: true, message: '홍보가 끝난 레스토랑 처리에 성공하였습니다.' };
    } catch (error) {
      console.log('checkPromotedRestaurants error');
      return { ok: false, message: '홍보가 끝난 레스토랑 처리에 실패하였습니다.' };
    }
  }
}

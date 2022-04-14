import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePaymentInput, CreatePaymentOutput } from './dtos/createPayment.dto';
import { SeePaymentsOutput } from './dtos/seePayments.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
  ) {}

  async seePayments(loggedInUser: User): Promise<SeePaymentsOutput> {
    try {
      const foundAllPayments: Payment[] = await this.paymentRepository.find({ user: loggedInUser });
      if (foundAllPayments.length === 0) {
        return { ok: false, message: '결제가 존재하지 않습니다.' };
      }
      return { ok: true, message: '전체 결제 보기에 성공하였습니다.', payments: foundAllPayments };
    } catch (error) {
      console.log('seePayments error');
      return { ok: false, message: '전체 결제 보기에 실패하였습니다.' };
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
      return { ok: true, message: '결제 생성에 성공하였습니다.' };
    } catch (error) {
      console.log('createPayment error');
      return { ok: false, message: '결제 생성에 실패하였습니다.' };
    }
  }
}

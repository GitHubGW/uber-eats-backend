import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Payment } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, ['transactionId', 'restaurantId']) {}

@ObjectType()
export class CreatePaymentOutput extends CommonOutput {}

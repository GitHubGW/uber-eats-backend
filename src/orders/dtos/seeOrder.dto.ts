import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class SeeOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class SeeOrderOutput extends CommonOutput {
  @Field((type) => Order, { nullable: true })
  @IsOptional()
  order?: Order;
}

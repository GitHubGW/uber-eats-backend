import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Payment } from '../entities/payment.entity';

@ObjectType()
export class SeeAllPaymentsOutput extends CommonOutput {
  @Field((type) => [Payment], { nullable: true })
  @IsOptional()
  payments?: Payment[];
}

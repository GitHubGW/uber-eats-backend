import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Order } from '../entities/order.entity';
import { Status } from '../enums/status.enum';

@InputType()
export class SeeAllOrdersInput {
  @Field((type) => Status, { nullable: true })
  @IsOptional()
  status?: Status;
}

@ObjectType()
export class SeeAllOrdersOutput extends CommonOutput {
  @Field((type) => [Order], { nullable: true })
  @IsOptional()
  orders?: Order[];
}

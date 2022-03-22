import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { DishOption } from 'src/dishes/entities/dish.entity';

@InputType()
export class CreateOrderItemInput {
  @Field((type) => Number)
  @IsNumber()
  dishId: number;

  @Field((type) => [DishOption], { nullable: true })
  @IsOptional()
  dishOptions?: DishOption[];
}

@InputType()
export class CreateOrderInput {
  @Field((type) => Number)
  @IsNumber()
  restaurantId: number;

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CommonOutput {}

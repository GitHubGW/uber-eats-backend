import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field((type) => Number)
  @IsNumber()
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CommonOutput {}

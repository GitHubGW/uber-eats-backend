import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { CreateRestaurantInput } from './createRestaurant.dto';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field((type) => Number)
  @IsNumber()
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends CommonOutput {}

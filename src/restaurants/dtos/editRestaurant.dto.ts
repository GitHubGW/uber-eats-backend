import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CreateRestaurantDto } from './createRestaurant.dto';

@InputType()
class EditRestaurantInputType extends PartialType(CreateRestaurantDto) {}

@InputType()
export class EditRestaurantDto {
  @Field((type) => Number)
  @IsNumber()
  id: number;

  @Field((type) => EditRestaurantInputType)
  data: EditRestaurantInputType;
}

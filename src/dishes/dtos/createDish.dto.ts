import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, ['name', 'price', 'imageUrl', 'description', 'dishOptions']) {
  @Field((type) => Number)
  @IsNumber()
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CommonOutput {}

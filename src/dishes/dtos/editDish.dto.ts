import { Field, InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'description',
  'price',
  'imageUrl',
  'dishOptions',
]) {
  @Field((type) => Number)
  @IsNumber()
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CommonOutput {}

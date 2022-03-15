import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { OneToMany } from 'typeorm';
import { Dish } from '../entities/dish.entity';
import { DishOption } from '../entities/dishOption.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, ['name', 'price', 'imageUrl', 'description']) {
  @Field((type) => Number)
  @IsNumber()
  restaurantId: number;

  @Field((type) => [DishOption], { nullable: true })
  @OneToMany(() => DishOption, (dishOption: DishOption) => dishOption.dish, { nullable: true })
  @IsOptional()
  dishOptions?: DishOption[];
}

@ObjectType()
export class CreateDishOutput extends CommonOutput {}

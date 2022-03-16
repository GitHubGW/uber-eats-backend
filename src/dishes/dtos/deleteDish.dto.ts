import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';

@InputType()
export class DeleteDishInput {
  @Field((type) => Number)
  @IsNumber()
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends CommonOutput {}

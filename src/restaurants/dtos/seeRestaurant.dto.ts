import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SeeRestaurantInput {
  @Field((type) => Number)
  @IsNumber()
  restaurantId: number;
}

@ObjectType()
export class SeeRestaurantOutput extends CommonOutput {
  @Field((type) => Restaurant, { nullable: true })
  @IsOptional()
  restaurant?: Restaurant;
}

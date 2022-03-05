import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, ['name', 'address', 'imageUrl']) {
  @Field((type) => String)
  @IsString()
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CommonOutput {}

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { PaginationInput, PaginationOutput } from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SeeAllRestaurantsInput extends PaginationInput {}

@ObjectType()
export class SeeAllRestaurantsOutput extends PaginationOutput {
  @Field((type) => [Restaurant], { nullable: true })
  @IsOptional()
  restaurants?: Restaurant[];
}

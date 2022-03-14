import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PaginationInput, PaginationOutput } from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SearchRestaurantsInput extends PaginationInput {
  @Field((type) => String)
  @IsString()
  restaurantName: string;
}

@ObjectType()
export class SearchRestaurantsOutput extends PaginationOutput {
  @Field((type) => [Restaurant], { nullable: true })
  @IsOptional()
  restaurants?: Restaurant[];
}

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { CommonOutput } from './common.dto';

@InputType()
export class PaginationInput {
  @Field((type) => Number, { defaultValue: 1 })
  @IsNumber()
  page: number;
}

@ObjectType()
export class PaginationOutput extends CommonOutput {
  @Field((type) => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  totalPages?: number;
}

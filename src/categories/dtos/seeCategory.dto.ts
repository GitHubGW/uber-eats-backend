import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PaginationInput, PaginationOutput } from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class SeeCategoryInput extends PaginationInput {
  @Field((type) => String)
  @IsString()
  categoryName: string;
}

@ObjectType()
export class SeeCategoryOutput extends PaginationOutput {
  @Field((type) => Category, { nullable: true })
  @IsOptional()
  category?: Category;
}

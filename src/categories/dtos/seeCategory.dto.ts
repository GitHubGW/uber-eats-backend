import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class SeeCategoryInput {
  @Field((type) => String)
  @IsString()
  categoryName: string;
}

@ObjectType()
export class SeeCategoryOutput extends CommonOutput {
  @Field((type) => Category, { nullable: true })
  @IsOptional()
  category?: Category;
}

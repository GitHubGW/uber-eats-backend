import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class SeeAllCategoriesOutput extends CommonOutput {
  @Field((type) => [Category], { nullable: true })
  @IsOptional()
  category?: Category[];
}

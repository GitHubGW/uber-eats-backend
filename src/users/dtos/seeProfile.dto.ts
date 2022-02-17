import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class SeeProfileInput {
  @Field((type) => Number)
  @IsNumber()
  id: number;
}

@ObjectType()
export class SeeProfileOutput extends CommonOutput {
  @Field((type) => User, { nullable: true })
  @IsOptional()
  user?: User;
}

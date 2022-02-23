import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class ResetPasswordInput extends PickType(User, ['username', 'password']) {
  @Field((type) => String)
  @IsString()
  confirmPassword: string;
}

@ObjectType()
export class ResetPasswordOutput extends CommonOutput {}

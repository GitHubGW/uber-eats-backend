import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, ['email', 'password', 'role']) {}

@ObjectType()
export class CreateAccountOutput {
  @Field((type) => Boolean)
  @IsBoolean()
  ok: boolean;

  @Field((type) => String)
  @IsString()
  message: string;
}

import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, ['email', 'password', 'role']) {}

@ObjectType()
export class CreateAccountOutput extends CommonOutput {}

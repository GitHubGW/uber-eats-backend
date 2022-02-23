import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';
import { User } from 'src/users/entities/user.entity';

@InputType()
export class SendPasswordResetInput extends PickType(User, ['email']) {}

@ObjectType()
export class SendPasswordResetOutput extends CommonOutput {}

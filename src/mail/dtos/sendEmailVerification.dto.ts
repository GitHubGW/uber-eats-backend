import { ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';

@ObjectType()
export class SendEmailVerificationOutput extends CommonOutput {}

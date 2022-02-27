import { ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dtos/common.dto';

@ObjectType()
export class SendBillingOutput extends CommonOutput {}

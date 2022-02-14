import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';

@ObjectType()
export class CommonOutput {
  @Field((type) => Boolean)
  @IsBoolean()
  ok: boolean;

  @Field((type) => String)
  @IsString()
  message: string;
}

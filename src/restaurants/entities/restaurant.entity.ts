import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RestaurantEntity {
  @Field((type) => String)
  name: string;

  @Field((type) => Boolean, { nullable: true })
  isOwner?: boolean;

  @Field((type) => String)
  address: string;

  @Field((type) => String)
  ownerName: string;
}

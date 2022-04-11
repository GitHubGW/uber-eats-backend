import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends Common {
  @Field((type) => Number)
  @Column()
  @IsNumber()
  transactionId: number;

  @Field((type) => User)
  @ManyToOne(() => User, (user: User) => user.payments, { onDelete: 'CASCADE' })
  user: User;

  @Field((type) => Number)
  @RelationId((payment: Payment) => payment.user)
  @IsNumber()
  userId: number;

  @Field((type) => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.payments, { onDelete: 'CASCADE' })
  restaurant: Restaurant;

  @Field((type) => Number)
  @RelationId((payment: Payment) => payment.restaurant)
  @IsNumber()
  restaurantId: number;
}

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Dish } from 'src/dishes/entities/dish.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends Common {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(1, 20)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(1, 50)
  address: string;

  @Field((type) => String)
  @Column()
  @IsString()
  imageUrl: string;

  @Field((type) => Category, { nullable: true })
  @ManyToOne(() => Category, (category: Category) => category.restaurants, { nullable: true, onDelete: 'SET NULL' })
  @IsOptional()
  category?: Category;

  @Field((type) => User)
  @ManyToOne(() => User, (user: User) => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @Field((type) => Number)
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  @IsNumber()
  ownerId: number;

  @Field((type) => [Dish])
  @OneToMany(() => Dish, (dish: Dish) => dish.restaurant)
  dishes: Dish[];

  @Field((type) => [Order])
  @OneToMany(() => Order, (order: Order) => order.restaurant)
  @IsOptional()
  restaurantOrders?: Order[];

  @Field((type) => [Payment])
  @OneToMany(() => Payment, (payment: Payment) => payment.restaurant)
  @IsOptional()
  payments?: Payment[];

  @Field((type) => Boolean, { defaultValue: false })
  @Column({ default: false })
  @IsBoolean()
  isPromoted: Boolean;

  @Field((type) => Date, { nullable: true })
  @Column({ nullable: true })
  @IsOptional()
  promotedUntilDate?: Date;
}

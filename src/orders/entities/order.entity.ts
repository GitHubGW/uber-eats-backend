import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from 'typeorm';
import { Status } from '../enums/status.enum';
import { OrderItem } from './orderItem.entity';

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends Common {
  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.restaurantOrders, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  @IsOptional()
  restaurant?: Restaurant;

  @Field((type) => Number)
  @RelationId((order: Order) => order.restaurant)
  @IsNumber()
  restaurantId: number;

  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.customerOrders, { onDelete: 'SET NULL', nullable: true, eager: true })
  @IsOptional()
  customer?: User;

  @Field((type) => Number)
  @RelationId((order: Order) => order.customer)
  @IsNumber()
  customerId: number;

  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.driverOrders, { onDelete: 'SET NULL', nullable: true, eager: true })
  @IsOptional()
  driver?: User;

  @Field((type) => Number)
  @RelationId((order: Order) => order.driver)
  @IsNumber()
  driverId: number;

  @Field((type) => [OrderItem])
  @ManyToMany(() => OrderItem, { eager: true })
  @JoinTable()
  orderItems: OrderItem[];

  @Field((type) => Number, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @Field((type) => Status, { defaultValue: Status.Pending })
  @Column({ type: 'enum', enum: Status, default: Status.Pending })
  @IsEnum(Status)
  status: Status;
}

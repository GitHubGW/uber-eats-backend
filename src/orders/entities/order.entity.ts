import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Dish } from 'src/dishes/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Status } from '../enums/status.enum';

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends Common {
  @Field((type) => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.restaurantOrders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @IsOptional()
  restaurant?: Restaurant;

  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.customerOrders, { onDelete: 'SET NULL', nullable: true })
  @IsOptional()
  customer?: User;

  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.driverOrders, { onDelete: 'SET NULL', nullable: true })
  @IsOptional()
  driver: User;

  @Field((type) => [Dish])
  @ManyToMany(() => Dish)
  @JoinTable()
  dishes: Dish[];

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

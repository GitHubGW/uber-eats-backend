import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Dish, DishOption } from 'src/dishes/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends Common {
  @Field((type) => Dish)
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'CASCADE', eager: true })
  @IsOptional()
  dish?: Dish;

  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  @IsOptional()
  dishOptions?: DishOption[];
}

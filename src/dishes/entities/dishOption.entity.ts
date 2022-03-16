import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Dish } from './dish.entity';

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class DishOption extends Common {
  @Field((type) => String)
  @Column()
  @IsString()
  name: string;

  @Field((type) => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => Dish, { nullable: true })
  @ManyToOne(() => Dish, (dish: Dish) => dish.dishOptions, { nullable: true, onDelete: 'CASCADE' })
  @IsOptional()
  dish: Dish;

  @Field((type) => Number, { nullable: true })
  @RelationId((dishOption: DishOption) => dishOption.dish)
  @IsNumber()
  dishId: number;
}

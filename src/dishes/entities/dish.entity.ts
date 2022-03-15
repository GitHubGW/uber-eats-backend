import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { DishOption } from './dishOption.entity';

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends Common {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(1, 20)
  name: string;

  @Field((type) => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => String)
  @Column()
  @IsString()
  imageUrl: string;

  @Field((type) => String, { nullable: true })
  @Column()
  @IsString()
  @Length(1, 120)
  description: string;

  @Field((type) => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.dishes, { onDelete: 'CASCADE' })
  restaurant: Restaurant;

  @Field((type) => Number)
  @RelationId((dish: Dish) => dish.restaurant)
  @IsNumber()
  restaurantId: number;

  @Field((type) => [DishOption], { nullable: true })
  @OneToMany(() => DishOption, (dishOption: DishOption) => dishOption.dish, { nullable: true })
  @IsOptional()
  dishOptions?: DishOption[];
}

import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Category extends Common {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(1, 20)
  name: string;

  @Field((type) => String, { defaultValue: 'https://i.ibb.co/Df48zR7/dish.png' })
  @Column({ default: 'https://i.ibb.co/Df48zR7/dish.png' })
  @IsString()
  imageUrl: string;

  @Field((type) => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}

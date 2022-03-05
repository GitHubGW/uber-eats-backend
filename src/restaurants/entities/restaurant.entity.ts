import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@InputType({ isAbstract: true })
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
  imageUrl: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, { nullable: true, onDelete: 'SET NULL' })
  @IsOptional()
  category?: Category;

  @Field((type) => User)
  @ManyToOne(() => User, (user) => user.restaurants)
  owner: User;
}

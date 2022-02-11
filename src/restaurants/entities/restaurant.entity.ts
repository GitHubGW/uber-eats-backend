import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @Field((type) => Number)
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @Field((type) => String)
  @Column()
  @IsString()
  name: string;

  @Field((type) => Boolean, { nullable: true })
  @Column()
  @IsBoolean()
  isOwner?: boolean;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field((type) => String)
  @Column()
  @IsString()
  categoryName: string;
}

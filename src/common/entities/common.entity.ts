import { Field, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';
import { CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Common {
  @Field((type) => Number)
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @Field((type) => Date)
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @Field((type) => Date)
  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;
}

import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { InternalServerErrorException, Res } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends Common {
  @Field((type) => String)
  @Column({ unique: true })
  @IsEmail()
  @Length(1, 30)
  email: string;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(1, 20)
  username: string;

  @Field((type) => String)
  @Column()
  @IsString()
  password: string;

  @Field((type) => Boolean, { defaultValue: false })
  @Column({ default: false })
  @IsBoolean()
  emailVerified: boolean;

  @Field((type) => Role)
  @Column({ type: 'enum', enum: Role })
  @IsEnum(Role)
  role: Role;

  @Field((type) => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant: Restaurant) => restaurant.owner)
  @IsOptional()
  restaurants?: Restaurant[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
      }
    } catch (error) {
      console.log('hashPassword error');
      throw new InternalServerErrorException();
    }
  }
}

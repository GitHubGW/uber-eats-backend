import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { InternalServerErrorException, Res } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends Common {
  @Field((type) => String)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field((type) => String)
  @Column()
  @IsString()
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
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
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

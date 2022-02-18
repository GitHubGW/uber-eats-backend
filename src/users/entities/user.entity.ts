import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';

enum Role {
  Owner,
  Customer,
  DeliveryMan,
}

registerEnumType(Role, { name: 'Role' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends Common {
  @Field((type) => String)
  @Column()
  @IsEmail()
  email: string;

  @Field((type) => String)
  @Column()
  @IsString()
  password: string;

  @Field((type) => Role)
  @Column({ type: 'enum', enum: Role })
  @IsEnum(Role)
  role: Role;

  @BeforeInsert()
  @BeforeUpdate()
  async handleHashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.log('handleHashPassword error');
      throw new InternalServerErrorException();
    }
  }
}

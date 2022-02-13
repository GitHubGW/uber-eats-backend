import { ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Column, Entity } from 'typeorm';

type Role = 'Owner' | 'Customer' | 'DeliveryMan';

@Entity()
export class User extends Common {
  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  password: string;

  @Column()
  role: Role;
}

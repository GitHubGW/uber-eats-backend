import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Column, Entity } from 'typeorm';

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
  role: Role;
}

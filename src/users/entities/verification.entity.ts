import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends Common {
  @Field((type) => String)
  @Column()
  @IsString()
  code: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @BeforeInsert()
  async handleCreateVerificationCode() {
    const randomCode: string = uuidv4();
    this.code = randomCode.substring(0, 4).toUpperCase();
  }
}

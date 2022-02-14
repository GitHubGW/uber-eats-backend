import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/createAccount.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const foundUser: User | undefined = await this.usersRepository.findOne({ email });

      if (foundUser) {
        return { ok: false, message: '이미 존재하는 계정입니다.' };
      }

      const createdUser: User = await this.usersRepository.create({ email, password, role });
      await this.usersRepository.save(createdUser);
      return { ok: true, message: '계정 생성에 성공하였습니다.' };
    } catch (error) {
      console.log('createAccount error');
      return { ok: false, message: '계정 생성에 실패하였습니다.' };
    }
  }
}

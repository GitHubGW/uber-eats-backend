import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/createAccount.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { SeeProfileInput, SeeProfileOutput } from './dtos/seeProfile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verification) private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}

  seeMe(loggedInUser: User): User {
    return loggedInUser;
  }

  async seeProfile({ id }: SeeProfileInput): Promise<SeeProfileOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne({ id });

      if (foundUser === undefined) {
        return { ok: false, message: '존재하지 않는 계정입니다.' };
      }

      return { ok: true, message: '프로필 보기에 성공하였습니다.', user: foundUser };
    } catch (error) {
      console.log('seeProfile error');
      return { ok: false, message: '프로필 보기에 실패하였습니다.' };
    }
  }

  async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne({ email });

      if (foundUser) {
        return { ok: false, message: '이미 존재하는 계정입니다.' };
      }

      const createdUser: User = await this.userRepository.create({ email, password, role });
      await this.userRepository.save(createdUser);
      const createdVerification: Verification = await this.verificationRepository.create({ user: createdUser });
      await this.verificationRepository.save(createdVerification);
      return { ok: true, message: '계정 생성에 성공하였습니다.' };
    } catch (error) {
      console.log('createAccount error');
      return { ok: false, message: '계정 생성에 실패하였습니다.' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne({ email });

      if (foundUser === undefined) {
        return { ok: false, message: '존재하지 않는 계정입니다.' };
      }

      const isPasswordMatch: boolean = await bcrypt.compare(password, foundUser.password);

      if (isPasswordMatch === false) {
        return { ok: false, message: '잘못된 비밀번호입니다.' };
      }

      const token: string | null = await this.jwtService.handleSignToken({ id: foundUser.id });
      return { ok: true, message: '로그인에 성공하였습니다.', token };
    } catch (error) {
      console.log('login error');
      return { ok: false, message: '로그인에 실패하였습니다.' };
    }
  }

  async editProfile({ email, password }: EditProfileInput, { id }: User): Promise<EditProfileOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne(id);

      if (email) {
        foundUser.email = email;
        foundUser.emailVerified = false;
        const createdVerification: Verification = await this.verificationRepository.create({ user: foundUser });
        await this.verificationRepository.save(createdVerification);
      }
      if (password) {
        foundUser.password = password;
      }

      await this.userRepository.save(foundUser);
      return { ok: true, message: '프로필 수정에 성공하였습니다.' };
    } catch (error) {
      console.log('editProfile error');
      return { ok: false, message: '프로필 수정에 실패하였습니다.' };
    }
  }
}

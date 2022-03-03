import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification } from './entities/verification.entity';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { CreateAccountInput, CreateAccountOutput } from './dtos/createAccount.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { SeeProfileInput, SeeProfileOutput } from './dtos/seeProfile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verifyEmail.dto';
import { ResetPasswordInput, ResetPasswordOutput } from './dtos/resetPassword.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verification) private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

      const createdUser: User = await this.userRepository.create({
        email,
        username: email.split('@')[0],
        password,
        role,
      });
      await this.userRepository.save(createdUser);
      const createdVerification: Verification = await this.verificationRepository.create({ user: createdUser });
      await this.verificationRepository.save(createdVerification);
      await this.mailService.sendEmailVerification(createdUser.email, createdUser.username, createdVerification.code);
      return { ok: true, message: '계정 생성에 성공하였습니다.' };
    } catch (error) {
      console.log('createAccount error');
      return { ok: false, message: '계정 생성에 실패하였습니다.' };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne({ email }, { select: ['id', 'password'] });

      if (foundUser === undefined) {
        return { ok: false, message: '존재하지 않는 계정입니다.' };
      }

      const isPasswordMatch: boolean = await bcrypt.compare(password, foundUser.password);

      if (isPasswordMatch === false) {
        return { ok: false, message: '잘못된 비밀번호입니다.' };
      }

      const token: string | null = await this.jwtService.signToken({ id: foundUser.id });
      return { ok: true, message: '로그인에 성공하였습니다.', token };
    } catch (error) {
      console.log('login error');
      return { ok: false, message: '로그인에 실패하였습니다.' };
    }
  }

  async editProfile({ email, username, password }: EditProfileInput, { id }: User): Promise<EditProfileOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne(id);

      if (foundUser === undefined) {
        return { ok: false, message: '존재하지 않는 계정입니다.' };
      }

      if (email) {
        const countedUser: number = await this.userRepository.count({ email });

        if (countedUser !== 0) {
          return { ok: false, message: '이미 사용 중인 이메일입니다.' };
        }

        foundUser.email = email;
        foundUser.emailVerified = false;
        await this.verificationRepository.delete({ user: foundUser });
        const createdVerification: Verification = await this.verificationRepository.create({ user: foundUser });
        await this.verificationRepository.save(createdVerification);
        await this.mailService.sendEmailVerification(foundUser.email, foundUser.username, createdVerification.code);
      }
      if (username) {
        foundUser.username = username;
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

  async verifyEmail({ code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const foundVerification: Verification | undefined = await this.verificationRepository.findOne(
        { code },
        { relations: ['user'] },
      );

      if (foundVerification === undefined) {
        return { ok: false, message: '존재하지 않는 인증 코드입니다.' };
      }

      await this.userRepository.update(foundVerification.user.id, { emailVerified: true });
      await this.verificationRepository.delete({ id: foundVerification.id });
      return { ok: true, message: '이메일 인증에 성공하였습니다.' };
    } catch (error) {
      console.log('verifyEmail error');
      return { ok: false, message: '이메일 인증에 실패하였습니다.' };
    }
  }

  async resetPassword({ username, password, confirmPassword }: ResetPasswordInput): Promise<ResetPasswordOutput> {
    try {
      const foundUser: User | undefined = await this.userRepository.findOne({ username });

      if (foundUser === undefined) {
        return { ok: false, message: '존재하지 않는 계정입니다.' };
      }
      if (password !== confirmPassword) {
        return { ok: false, message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' };
      }

      foundUser.password = password;
      await this.userRepository.save(foundUser);
      return { ok: true, message: '비밀번호 재설정에 성공하였습니다.' };
    } catch (error) {
      console.log('resetPassword error');
      return { ok: false, message: '비밀번호 재설정에 실패하였습니다.' };
    }
  }
}

import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountInput, CreateAccountOutput } from './dtos/createAccount.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { ResetPasswordInput, ResetPasswordOutput } from './dtos/resetPassword.dto';
import { SeeProfileInput, SeeProfileOutput } from './dtos/seeProfile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verifyEmail.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Query((returns) => User)
  seeMe(@Context('loggedInUser') loggedInUser: User): User {
    return this.usersService.seeMe(loggedInUser);
  }

  @Query((returns) => SeeProfileOutput)
  seeProfile(@Args('input') seeProfileInput: SeeProfileInput): Promise<SeeProfileOutput> {
    return this.usersService.seeProfile(seeProfileInput);
  }

  @Mutation((returns) => CreateAccountOutput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation((returns) => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditProfileOutput)
  editProfile(
    @Args('input') editProfileInput: EditProfileInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(editProfileInput, loggedInUser);
  }

  @Mutation((returns) => VerifyEmailOutput)
  verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput);
  }

  @Mutation((returns) => ResetPasswordOutput)
  resetPassword(@Args('input') resetPasswordInput: ResetPasswordInput): Promise<ResetPasswordOutput> {
    return this.usersService.resetPassword(resetPasswordInput);
  }
}

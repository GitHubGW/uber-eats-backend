import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateAccountInput, CreateAccountOutput } from './dtos/createAccount.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/editProfile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { ResetPasswordInput, ResetPasswordOutput } from './dtos/resetPassword.dto';
import { SeeProfileInput, SeeProfileOutput } from './dtos/seeProfile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verifyEmail.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from './enums/role.enum';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles([Role.Any])
  @Query((returns) => User)
  seeMe(@Context('loggedInUser') loggedInUser: User): User {
    return this.usersService.seeMe(loggedInUser);
  }

  @Roles([Role.Any])
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

  @Roles([Role.Any])
  @Mutation((returns) => EditProfileOutput)
  editProfile(
    @Args('input') editProfileInput: EditProfileInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(editProfileInput, loggedInUser);
  }

  @Roles([Role.Any])
  @Mutation((returns) => VerifyEmailOutput)
  verifyEmail(@Args('input') verifyEmailInput: VerifyEmailInput): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput);
  }

  @Roles([Role.Any])
  @Mutation((returns) => ResetPasswordOutput)
  resetPassword(@Args('input') resetPasswordInput: ResetPasswordInput): Promise<ResetPasswordOutput> {
    return this.usersService.resetPassword(resetPasswordInput);
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const gqlExecutionContext: GqlExecutionContext = GqlExecutionContext.create(context);
    const gqlContext = gqlExecutionContext.getContext();
    const loggedInUser: User | undefined = gqlContext['loggedInUser'];

    if (loggedInUser === undefined) {
      return false;
    }
    return true;
  }
}

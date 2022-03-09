import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { RolesType } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: RolesType[] | undefined = this.reflector.get('roles', context.getHandler());

    if (roles === undefined) {
      return true;
    }

    const gqlExecutionContext: GqlExecutionContext = GqlExecutionContext.create(context);
    const gqlContext = gqlExecutionContext.getContext();
    const loggedInUser: User | undefined = gqlContext['loggedInUser'];

    if (loggedInUser === undefined) {
      return false;
    }

    const includedAny: boolean = roles.includes(Role.Any);
    const includedRole: boolean = roles.includes(loggedInUser.role);

    if (includedAny || includedRole === true) {
      return true;
    }

    return false;
  }
}

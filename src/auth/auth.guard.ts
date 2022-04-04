import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from 'jsonwebtoken';
import { JwtService } from 'src/jwt/jwt.service';
import { SeeProfileOutput } from 'src/users/dtos/seeProfile.dto';
import { UsersService } from 'src/users/users.service';
import { RolesType } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: RolesType[] | undefined = this.reflector.get('roles', context.getHandler());
    if (roles === undefined) {
      return true;
    }

    const gqlExecutionContext: GqlExecutionContext = GqlExecutionContext.create(context);
    const gqlContext: any = gqlExecutionContext.getContext();
    const token: string = gqlContext?.token || gqlContext?.req?.headers?.token;

    if (token) {
      const payload: string | JwtPayload | null = await this.jwtService.verifyToken(token.toString());
      if (payload === null) {
        return false;
      }

      if (typeof payload === 'object' && 'id' in payload) {
        const { user }: SeeProfileOutput = await this.usersService.seeProfile({ id: payload.id });
        if (user) {
          gqlContext['loggedInUser'] = user;
          return true;
        }
      }
    } else {
      return false;
    }
  }
}

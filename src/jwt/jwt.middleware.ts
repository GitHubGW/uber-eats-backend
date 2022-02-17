import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { SeeProfileOutput } from 'src/users/dtos/seeProfile.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token: string | string[] | undefined = req.headers.token;

    if (token === undefined) {
      return next();
    }

    const payload: string | JwtPayload | null = await this.jwtService.handleVerifyToken(token.toString());

    if (payload === null) {
      return next();
    }

    if (typeof payload === 'object' && 'id' in payload) {
      try {
        const { user }: SeeProfileOutput = await this.usersService.seeProfile({ id: payload.id });

        if (user) {
          req['loggedInUser'] = user;
          return next();
        }
      } catch (error) {
        console.log('JwtMiddleware use error');
        return next();
      }
    }
  }
}

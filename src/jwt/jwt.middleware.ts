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

    if (token !== undefined) {
      try {
        const payload: string | JwtPayload | null = await this.jwtService.verifyToken(token.toString());

        if (typeof payload === 'object' && 'id' in payload) {
          const { user }: SeeProfileOutput = await this.usersService.seeProfile({ id: payload.id });
          req['loggedInUser'] = user;
        }
      } catch (error) {
        console.log('JwtMiddleware use error');
      }
    }

    return next();
  }
}

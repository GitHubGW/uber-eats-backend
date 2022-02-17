import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import { JwtOptions } from './interfaces/jwtOptions.interface';

@Injectable()
export class JwtService {
  constructor(@Inject('jwtOptions') private readonly jwtOptions: JwtOptions) {}

  async handleSignToken(payload: object): Promise<string | null> {
    try {
      const token: string = await jwt.sign(payload, this.jwtOptions.jwtSecretKey);
      return token;
    } catch (error) {
      console.log('handleSignToken error');
      return null;
    }
  }

  async handleVerifyToken(token: string): Promise<string | jwt.JwtPayload | null> {
    try {
      const payload: string | JwtPayload = await jwt.verify(token, this.jwtOptions.jwtSecretKey);
      return payload;
    } catch (error) {
      console.log('handleVerifyToken error');
      return null;
    }
  }
}

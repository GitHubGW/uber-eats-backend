import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import { JwtOptions } from './interfaces/jwt.interface';

@Injectable()
export class JwtService {
  constructor(@Inject('jwtOptions') private readonly jwtOptions: JwtOptions) {}

  async signToken(payload: object): Promise<string | null> {
    try {
      const token: string = await jwt.sign(payload, this.jwtOptions.jwtSecretKey);
      return token;
    } catch (error) {
      console.log('signToken error');
      return null;
    }
  }

  async verifyToken(token: string): Promise<string | jwt.JwtPayload | null> {
    try {
      const payload: string | JwtPayload = await jwt.verify(token, this.jwtOptions.jwtSecretKey);
      return payload;
    } catch (error) {
      console.log('verifyToken error');
      return null;
    }
  }
}

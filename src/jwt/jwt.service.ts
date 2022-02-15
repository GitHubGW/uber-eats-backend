import * as jwt from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import { JwtOptions } from './interfaces/jwtOptions.interface';

@Injectable()
export class JwtService {
  constructor(@Inject('jwtOptions') private readonly jwtOptions: JwtOptions) {}

  async handleSignToken(payload: object): Promise<string> {
    const token: string = await jwt.sign(payload, this.jwtOptions.jwtSecretKey);
    return token;
  }
}

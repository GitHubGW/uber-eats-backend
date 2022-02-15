import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtOptions } from './interfaces/jwtOptions.interface';
import { JwtService } from './jwt.service';

@Global()
@Module({})
export class JwtModule {
  static forRoot(jwtOptions: JwtOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [JwtService, { provide: 'jwtOptions', useValue: jwtOptions }],
      exports: [JwtService],
    };
  }
}

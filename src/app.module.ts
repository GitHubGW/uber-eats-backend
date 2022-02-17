import * as Joi from 'joi';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { join } from 'path';
import { User } from './users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from './jwt/jwt.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.development' : '.env.test',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development').required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.string().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET_KEY: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      playground: true,
      context: ({ req }) => {
        return { loggedInUser: req.loggedInUser };
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: process.env.NODE_ENV === 'production' ? false : true,
      logging: false,
      entities: [User],
    }),
    JwtModule.forRoot({ jwtSecretKey: process.env.JWT_SECRET_KEY }),
    CommonModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(JwtMiddleware).forRoutes({ path: '/graphql', method: RequestMethod.POST });
  }
}

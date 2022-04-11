import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import { JwtModule } from './jwt/jwt.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './categories/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { CategoriesModule } from './categories/categories.module';
import { DishesModule } from './dishes/dishes.module';
import { Dish } from './dishes/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/orderItem.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';

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
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      playground: true,
      context: ({ req }) => {
        return { loggedInUser: req.loggedInUser };
      },
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams) => {
            return connectionParams;
          },
          onDisconnect: () => {},
        },
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
      entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem, Payment],
    }),
    JwtModule.forRoot({
      jwtSecretKey: process.env.JWT_SECRET_KEY,
    }),
    MailModule.forRoot({
      mailgunApiKey: process.env.MAILGUN_API_KEY,
      mailgunDomainName: process.env.MAILGUN_DOMAIN_NAME,
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    RestaurantsModule,
    CategoriesModule,
    DishesModule,
    OrdersModule,
    PaymentsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
  controllers: [],
})
export class AppModule {}

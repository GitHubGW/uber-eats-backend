import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

export const AuthUser: (...dataOrPipes: unknown[]) => ParameterDecorator = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const gqlExecutionContext: GqlExecutionContext = GqlExecutionContext.create(context);
    const gqlContext = gqlExecutionContext.getContext();
    const loggedInUser: User | undefined = gqlContext['loggedInUser'];
    return loggedInUser;
  },
);

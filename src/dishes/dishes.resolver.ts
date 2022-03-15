import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { DishesService } from './dishes.service';
import { CreateDishInput, CreateDishOutput } from './dtos/createDish.dto';

@Resolver()
export class DishesResolver {
  constructor(private readonly dishesService: DishesService) {}

  @Roles([Role.Owner])
  @Mutation((returns) => CreateDishOutput)
  createDish(
    @Args('input') createDishInput: CreateDishInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<CreateDishOutput> {
    return this.dishesService.createDish(createDishInput, loggedInUser);
  }
}

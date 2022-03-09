import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/createRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Roles([Role.Owner])
  @Mutation((returns) => CreateRestaurantOutput)
  createRestaurant(
    @Args('input') createRestaurantInput: CreateRestaurantInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createRestaurant(createRestaurantInput, loggedInUser);
  }
}

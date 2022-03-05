import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/createRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  createRestaurant(
    @Args('input') createRestaurantInput: CreateRestaurantInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createRestaurant(createRestaurantInput, loggedInUser);
  }
}

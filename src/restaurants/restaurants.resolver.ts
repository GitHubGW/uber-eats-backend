import { Args, Context, Query, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/createRestaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/editRestaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/deleteRestaurant.dto';
import { SeeAllRestaurantsInput, SeeAllRestaurantsOutput } from './dtos/seeAllRestaurants.dto';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query((returns) => SeeAllRestaurantsOutput)
  seeAllRestaurants(@Args('input') seeAllRestaurantsInput: SeeAllRestaurantsInput): Promise<SeeAllRestaurantsOutput> {
    return this.restaurantsService.seeAllRestaurants(seeAllRestaurantsInput);
  }

  @Roles([Role.Owner])
  @Mutation((returns) => CreateRestaurantOutput)
  createRestaurant(
    @Args('input') createRestaurantInput: CreateRestaurantInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.createRestaurant(createRestaurantInput, loggedInUser);
  }

  @Roles([Role.Owner])
  @Mutation((returns) => EditRestaurantOutput)
  editRestaurant(
    @Args('input') editRestaurantInput: EditRestaurantInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantsService.editRestaurant(editRestaurantInput, loggedInUser);
  }

  @Roles([Role.Owner])
  @Mutation((returns) => DeleteRestaurantOutput)
  deleteRestaurant(
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantsService.deleteRestaurant(deleteRestaurantInput, loggedInUser);
  }
}

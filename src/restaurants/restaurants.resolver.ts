import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/createRestaurant.dto';
import { EditRestaurantDto } from './dtos/editRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

@Resolver()
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query((returns) => [Restaurant])
  getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantsService.getAllRestaurants();
  }

  @Mutation((returns) => Boolean)
  createRestaurant(@Args('input') createRestaurantDto: CreateRestaurantDto): Promise<boolean> {
    return this.restaurantsService.createRestaurant(createRestaurantDto);
  }

  @Mutation((returns) => Boolean)
  editRestaurant(@Args('input') editRestaurantDto: EditRestaurantDto): Promise<boolean> {
    return this.restaurantsService.editRestaurant(editRestaurantDto);
  }
}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/createRestaurant.dto';
import { RestaurantEntity } from './entities/restaurant.entity';

@Resolver()
export class RestaurantsResolver {
  @Query((returns) => [RestaurantEntity])
  restaurants(@Args('isOwner') isOwner: boolean): RestaurantEntity[] {
    return [];
  }

  @Mutation((returns) => Boolean)
  createRestaurant(@Args() createRestaurantDto: CreateRestaurantDto): boolean {
    console.log('createRestaurantDto', createRestaurantDto);
    return true;
  }
}

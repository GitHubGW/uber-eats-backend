import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateDishInput, CreateDishOutput } from './dtos/createDish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/deleteDish.dto';
import { Dish } from './entities/dish.entity';
import { DishOption } from './entities/dishOption.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish) private readonly dishesRepository: Repository<Dish>,
    @InjectRepository(DishOption) private readonly dishOptionsRepository: Repository<DishOption>,
    @InjectRepository(Restaurant) private readonly restaurantsRepository: Repository<Restaurant>,
  ) {}

  async createDish(
    { restaurantId, name, price, imageUrl, description, dishOptions }: CreateDishInput,
    loggedInUser: User,
  ): Promise<CreateDishOutput> {
    try {
      const foundRestaurant: Restaurant | undefined = await this.restaurantsRepository.findOne({ id: restaurantId });

      if (foundRestaurant === undefined) {
        return { ok: false, message: '존재하지 않는 레스토랑입니다.' };
      }
      if (foundRestaurant.ownerId !== loggedInUser.id) {
        return { ok: false, message: '음식을 생성할 수 없는 레스토랑입니다.' };
      }

      const createdDish: Dish = this.dishesRepository.create({
        name,
        price,
        imageUrl,
        description,
        restaurant: foundRestaurant,
      });
      await this.dishesRepository.save(createdDish);

      if (dishOptions) {
        dishOptions.map(async (dishOption: DishOption) => {
          const createdDishOption: DishOption = this.dishOptionsRepository.create({
            name: dishOption.name,
            price: dishOption.price,
            dish: createdDish,
          });
          await this.dishOptionsRepository.save(createdDishOption);
        });
      }

      return { ok: true, message: '음식 생성에 성공하였습니다.' };
    } catch (error) {
      console.log('createDish error');
      return { ok: false, message: '음식 생성에 실패하였습니다.' };
    }
  }

  async deleteDish({ dishId }: DeleteDishInput, loggedInUser: User): Promise<DeleteDishOutput> {
    try {
      const foundDish: Dish | undefined = await this.dishesRepository.findOne(
        { id: dishId },
        { relations: ['restaurant'] },
      );

      if (foundDish === undefined) {
        return { ok: false, message: '존재하지 않는 음식입니다.' };
      }
      if (foundDish.restaurant.ownerId !== loggedInUser.id) {
        return { ok: false, message: '음식을 삭제할 수 없는 레스토랑입니다.' };
      }

      await this.dishesRepository.delete({ id: dishId });
      return { ok: false, message: '음식 삭제에 성공하였습니다.' };
    } catch (error) {
      console.log('deleteDish error');
      return { ok: false, message: '음식 삭제에 실패하였습니다.' };
    }
  }
}

import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';
import { DishesService } from './dishes.service';
import { CreateDishInput, CreateDishOutput } from './dtos/createDish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/deleteDish.dto';
import { EditDishInput, EditDishOutput } from './dtos/editDish.dto';

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

  @Roles([Role.Owner])
  @Mutation((returns) => EditDishOutput)
  editDish(
    @Args('input') editDishInput: EditDishInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<EditDishOutput> {
    return this.dishesService.editDish(editDishInput, loggedInUser);
  }

  @Roles([Role.Owner])
  @Mutation((returns) => DeleteDishOutput)
  deleteDish(
    @Args('input') deleteDishInput: DeleteDishInput,
    @Context('loggedInUser') loggedInUser: User,
  ): Promise<DeleteDishOutput> {
    return this.dishesService.deleteDish(deleteDishInput, loggedInUser);
  }
}

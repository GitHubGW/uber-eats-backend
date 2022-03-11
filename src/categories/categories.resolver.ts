import { Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { SeeAllCategoriesOutput } from './dtos/seeAllCategories.dto';
import { Category } from './entities/category.entity';

@Resolver((of) => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ResolveField((returns) => Number)
  totalRestaurants(): number {
    return 111;
  }

  @Query((returns) => SeeAllCategoriesOutput)
  seeAllCategories(): Promise<SeeAllCategoriesOutput> {
    return this.categoriesService.seeAllCategories();
  }
}

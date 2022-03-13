import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { SeeAllCategoriesOutput } from './dtos/seeAllCategories.dto';
import { SeeCategoryInput, SeeCategoryOutput } from './dtos/seeCategory.dto';
import { Category } from './entities/category.entity';

@Resolver((of) => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ResolveField((returns) => Number)
  totalRestaurants(@Parent() category: Category): Promise<number> {
    return this.categoriesService.totalRestaurants(category);
  }

  @Query((returns) => SeeAllCategoriesOutput)
  seeAllCategories(): Promise<SeeAllCategoriesOutput> {
    return this.categoriesService.seeAllCategories();
  }

  @Query((returns) => SeeCategoryOutput)
  seeCategory(@Args('input') seeCategoryInput: SeeCategoryInput): Promise<SeeCategoryOutput> {
    return this.categoriesService.seeCategory(seeCategoryInput);
  }
}

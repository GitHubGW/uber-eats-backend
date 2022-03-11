import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  handleCreateCategory(name: string): void {
    const categoryName: string = name.trim().toLowerCase().replace(/ +/g, ' ');
    const categorySlug: string = categoryName.replace(/ /g, '-');
  }
}

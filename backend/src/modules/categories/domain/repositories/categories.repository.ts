import { Category } from '../entities/category.entity';

export abstract class CategoriesRepository {
  abstract findAllByUser(userId: string): Promise<Category[]>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findByUserAndName(
    userId: string,
    name: string,
  ): Promise<Category | null>;
  abstract save(category: Category): Promise<Category>;
  abstract remove(category: Category): Promise<void>;
}

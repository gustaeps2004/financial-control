import { Category } from '../entities/category.entity';

export abstract class CategoriesRepository {
  abstract findAllByUser(userId: string): Promise<Category[]>;
  abstract findAllByUserIncludingDeleted(userId: string): Promise<Category[]>;
  abstract findById(
    id: string,
    options?: { withDeleted?: boolean },
  ): Promise<Category | null>;
  abstract findByUserAndName(
    userId: string,
    name: string,
  ): Promise<Category | null>;
  abstract findDeletedByUserAndName(
    userId: string,
    name: string,
  ): Promise<Category | null>;
  abstract save(category: Category): Promise<Category>;
  abstract remove(category: Category): Promise<void>;
  abstract restore(category: Category): Promise<void>;
}

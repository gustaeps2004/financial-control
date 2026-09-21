import { Category } from '../../../domain/entities/category.entity';
import { CategoryEntity } from '../entities/category.entity';

export class CategoryMapper {
  static toDomain(entity: CategoryEntity): Category {
    return Object.assign(new Category(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      name: entity.name,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(domain: Category): CategoryEntity {
    return Object.assign(new CategoryEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      name: domain.name,
    });
  }
}

import { Category } from '../../../domain/entities/category.entity';
import { CategoryKind } from '../../../domain/enums/category-kind.enum';

export class CategoryResponseDto {
  readonly id: string;
  readonly name: string;
  readonly kind: CategoryKind;
  readonly createdAt?: Date;

  constructor(category: Category) {
    this.id = category.id!;
    this.name = category.name;
    this.kind = category.kind;
    this.createdAt = category.createdAt;
  }
}

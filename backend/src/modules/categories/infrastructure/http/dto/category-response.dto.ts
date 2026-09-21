import { Category } from '../../../domain/entities/category.entity';

export class CategoryResponseDto {
  readonly id: string;
  readonly name: string;
  readonly createdAt?: Date;

  constructor(category: Category) {
    this.id = category.id!;
    this.name = category.name;
    this.createdAt = category.createdAt;
  }
}

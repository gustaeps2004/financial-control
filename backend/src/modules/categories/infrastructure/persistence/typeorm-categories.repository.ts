import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../domain/entities/category.entity';
import { CategoriesRepository } from '../../domain/repositories/categories.repository';
import { CategoryEntity } from './entities/category.entity';
import { CategoryMapper } from './mappers/category.mapper';

@Injectable()
export class TypeOrmCategoriesRepository extends CategoriesRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {
    super();
  }

  async findAllByUser(userId: string): Promise<Category[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return entities.map((entity) => CategoryMapper.toDomain(entity));
  }

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? CategoryMapper.toDomain(entity) : null;
  }

  async findByUserAndName(
    userId: string,
    name: string,
  ): Promise<Category | null> {
    const entity = await this.repository.findOne({ where: { userId, name } });
    return entity ? CategoryMapper.toDomain(entity) : null;
  }

  async save(category: Category): Promise<Category> {
    const saved = await this.repository.save(
      CategoryMapper.toPersistence(category),
    );
    return CategoryMapper.toDomain(saved);
  }

  async remove(category: Category): Promise<void> {
    await this.repository.softDelete(category.id!);
  }
}

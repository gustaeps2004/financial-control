import { Injectable } from '@nestjs/common';
import { Category } from '../domain/entities/category.entity';
import { CategoryAlreadyExistsException } from '../domain/exceptions/category-already-exists.exception';
import { CategoryNotFoundException } from '../domain/exceptions/category-not-found.exception';
import { CategoriesRepository } from '../domain/repositories/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findByUserAndName(
      userId,
      dto.name,
    );
    if (existing) {
      throw new CategoryAlreadyExistsException(dto.name);
    }

    const category: Category = Object.assign(new Category(), {
      userId,
      name: dto.name,
    });

    return this.categoriesRepository.save(category);
  }

  findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.findAllByUser(userId);
  }

  async rename(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOwnedOrFail(userId, id);

    if (category.name !== dto.name) {
      const existing = await this.categoriesRepository.findByUserAndName(
        userId,
        dto.name,
      );
      if (existing) {
        throw new CategoryAlreadyExistsException(dto.name);
      }
    }

    category.name = dto.name;

    return this.categoriesRepository.save(category);
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findOwnedOrFail(userId, id);
    await this.categoriesRepository.remove(category);
  }

  private async findOwnedOrFail(userId: string, id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category || category.userId !== userId) {
      throw new CategoryNotFoundException();
    }
    return category;
  }
}

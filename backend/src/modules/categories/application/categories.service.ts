import { Injectable } from '@nestjs/common';
import { Category } from '../domain/entities/category.entity';
import { CategoryKind } from '../domain/enums/category-kind.enum';
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

    // Bringing the deleted category back (instead of inserting a twin) keeps
    // everything already recorded under it attached to the same category.
    const deleted = await this.categoriesRepository.findDeletedByUserAndName(
      userId,
      dto.name,
    );
    if (deleted) {
      await this.categoriesRepository.restore(deleted);
      deleted.deletedAt = null;
      deleted.kind = dto.kind ?? deleted.kind;
      return this.categoriesRepository.save(deleted);
    }

    const category: Category = Object.assign(new Category(), {
      userId,
      name: dto.name,
      kind: dto.kind ?? CategoryKind.EXPENSE,
    });

    return this.categoriesRepository.save(category);
  }

  findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.findAllByUser(userId);
  }

  // Past records keep pointing at categories deleted since, so readers that
  // resolve history need them too.
  findAllIncludingDeleted(userId: string): Promise<Category[]> {
    return this.categoriesRepository.findAllByUserIncludingDeleted(userId);
  }

  /**
   * Public lookup for other modules. Only active categories can be picked for
   * new records; `includeDeleted` is for re-validating an existing reference.
   */
  async getOwned(
    userId: string,
    id: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<Category> {
    const category = await this.categoriesRepository.findById(id, {
      withDeleted: options.includeDeleted ?? false,
    });
    if (!category || category.userId !== userId) {
      throw new CategoryNotFoundException();
    }
    return category;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOwnedOrFail(userId, id);

    if (dto.name !== undefined && category.name !== dto.name) {
      const existing = await this.categoriesRepository.findByUserAndName(
        userId,
        dto.name,
      );
      if (existing) {
        throw new CategoryAlreadyExistsException(dto.name);
      }
      category.name = dto.name;
    }

    if (dto.kind !== undefined) category.kind = dto.kind;

    return this.categoriesRepository.save(category);
  }

  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findOwnedOrFail(userId, id);
    await this.categoriesRepository.remove(category);
  }

  private findOwnedOrFail(userId: string, id: string): Promise<Category> {
    return this.getOwned(userId, id);
  }
}

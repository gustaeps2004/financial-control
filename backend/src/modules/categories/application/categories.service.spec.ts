import { Test, TestingModule } from '@nestjs/testing';
import { Category } from '../domain/entities/category.entity';
import { CategoryKind } from '../domain/enums/category-kind.enum';
import { CategoryAlreadyExistsException } from '../domain/exceptions/category-already-exists.exception';
import { CategoryNotFoundException } from '../domain/exceptions/category-not-found.exception';
import { CategoriesRepository } from '../domain/repositories/categories.repository';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<CategoriesRepository>;

  const userId = 'user-1';
  const dto: CreateCategoryDto = { name: 'Groceries' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            findByUserAndName: jest.fn(),
            findDeletedByUserAndName: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            restore: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CategoriesService);
    repository = module.get(CategoriesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and persists a category owned by the user', async () => {
      repository.findByUserAndName.mockResolvedValue(null);
      repository.findDeletedByUserAndName.mockResolvedValue(null);
      repository.save.mockImplementation((category) =>
        Promise.resolve(category),
      );

      const result = await service.create(userId, dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          name: dto.name,
          kind: CategoryKind.EXPENSE,
        }),
      );
      expect(result.name).toBe(dto.name);
    });

    it('persists the requested kind', async () => {
      repository.findByUserAndName.mockResolvedValue(null);
      repository.findDeletedByUserAndName.mockResolvedValue(null);
      repository.save.mockImplementation((category) =>
        Promise.resolve(category),
      );

      const result = await service.create(userId, {
        name: 'Salary',
        kind: CategoryKind.INCOME,
      });

      expect(result.kind).toBe(CategoryKind.INCOME);
    });

    it('throws when the user already has a category with that name', async () => {
      repository.findByUserAndName.mockResolvedValue({
        id: 'cat-1',
      } as Category);

      await expect(service.create(userId, dto)).rejects.toThrow(
        CategoryAlreadyExistsException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('restores a deleted category with the same name instead of creating a twin', async () => {
      const deletedCategory = Object.assign(new Category(), {
        id: 'cat-old',
        userId,
        name: dto.name,
        deletedAt: new Date('2026-01-01'),
      });
      repository.findByUserAndName.mockResolvedValue(null);
      repository.findDeletedByUserAndName.mockResolvedValue(deletedCategory);
      repository.save.mockImplementation((category) =>
        Promise.resolve(category),
      );

      const result = await service.create(userId, {
        ...dto,
        kind: CategoryKind.FIXED_BILL,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.restore).toHaveBeenCalledWith(deletedCategory);
      expect(result.id).toBe('cat-old');
      expect(result.deletedAt).toBeNull();
      expect(result.kind).toBe(CategoryKind.FIXED_BILL);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCategoryDto = { name: 'Supermarket' };

    it('renames a category owned by the user', async () => {
      const existingCategory = Object.assign(new Category(), {
        id: 'cat-1',
        userId,
        name: 'Groceries',
      });
      repository.findById.mockResolvedValue(existingCategory);
      repository.findByUserAndName.mockResolvedValue(null);
      repository.save.mockImplementation((category) =>
        Promise.resolve(category),
      );

      const result = await service.update(userId, 'cat-1', updateDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Supermarket' }),
      );
      expect(result.name).toBe('Supermarket');
    });

    it('changes only the kind when no name is given', async () => {
      const existingCategory = Object.assign(new Category(), {
        id: 'cat-1',
        userId,
        name: 'Freelance',
        kind: CategoryKind.EXPENSE,
      });
      repository.findById.mockResolvedValue(existingCategory);
      repository.save.mockImplementation((category) =>
        Promise.resolve(category),
      );

      const result = await service.update(userId, 'cat-1', {
        kind: CategoryKind.INCOME,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.findByUserAndName).not.toHaveBeenCalled();
      expect(result.name).toBe('Freelance');
      expect(result.kind).toBe(CategoryKind.INCOME);
    });

    it('throws when the category does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(userId, 'missing-id', updateDto),
      ).rejects.toThrow(CategoryNotFoundException);
    });

    it('throws when the category belongs to another user', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(new Category(), {
          id: 'cat-1',
          userId: 'someone-else',
          name: 'Groceries',
        }),
      );

      await expect(service.update(userId, 'cat-1', updateDto)).rejects.toThrow(
        CategoryNotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws when renaming to a name already used by the user', async () => {
      const existingCategory = Object.assign(new Category(), {
        id: 'cat-1',
        userId,
        name: 'Groceries',
      });
      repository.findById.mockResolvedValue(existingCategory);
      repository.findByUserAndName.mockResolvedValue(
        Object.assign(new Category(), {
          id: 'cat-2',
          userId,
          name: 'Supermarket',
        }),
      );

      await expect(service.update(userId, 'cat-1', updateDto)).rejects.toThrow(
        CategoryAlreadyExistsException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes a category owned by the user', async () => {
      const existingCategory = Object.assign(new Category(), {
        id: 'cat-1',
        userId,
        name: 'Groceries',
      });
      repository.findById.mockResolvedValue(existingCategory);

      await service.remove(userId, 'cat-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.remove).toHaveBeenCalledWith(existingCategory);
    });

    it('throws when the category belongs to another user', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(new Category(), {
          id: 'cat-1',
          userId: 'someone-else',
          name: 'Groceries',
        }),
      );

      await expect(service.remove(userId, 'cat-1')).rejects.toThrow(
        CategoryNotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});

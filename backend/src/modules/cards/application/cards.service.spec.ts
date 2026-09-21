import { Test, TestingModule } from '@nestjs/testing';
import { Card } from '../domain/entities/card.entity';
import { CardNotFoundException } from '../domain/exceptions/card-not-found.exception';
import { CardsRepository } from '../domain/repositories/cards.repository';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

describe('CardsService', () => {
  let service: CardsService;
  let repository: jest.Mocked<CardsRepository>;

  const userId = 'user-1';
  const dto: CreateCardDto = {
    brand: 'Nubank',
    mark: 'NU',
    swatch: '#423a6a',
    nickname: 'Nubank card',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: CardsRepository,
          useValue: {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CardsService);
    repository = module.get(CardsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a card with defaulted limits', async () => {
      repository.save.mockImplementation((card) => Promise.resolve(card));

      await service.create(userId, dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          brand: dto.brand,
          mark: dto.mark,
          swatch: dto.swatch,
          nickname: dto.nickname,
          creditLimit: 3000,
          closingDay: 10,
          openingBalance: 0,
        }),
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateCardDto = { nickname: 'Renamed', creditLimit: 5000 };

    it('updates only the provided fields of a card owned by the user', async () => {
      const existingCard = Object.assign(new Card(), {
        id: 'card-1',
        userId,
        brand: 'Nubank',
        mark: 'NU',
        swatch: '#423a6a',
        nickname: 'Old nick',
        creditLimit: 3000,
        closingDay: 10,
        openingBalance: 0,
      });
      repository.findById.mockResolvedValue(existingCard);
      repository.save.mockImplementation((card) => Promise.resolve(card));

      const result = await service.update(userId, 'card-1', updateDto);

      expect(result.nickname).toBe('Renamed');
      expect(result.creditLimit).toBe(5000);
      expect(result.closingDay).toBe(10);
    });

    it('throws when the card does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(userId, 'missing-id', updateDto),
      ).rejects.toThrow(CardNotFoundException);
    });

    it('throws when the card belongs to another user', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(new Card(), { id: 'card-1', userId: 'someone-else' }),
      );

      await expect(service.update(userId, 'card-1', updateDto)).rejects.toThrow(
        CardNotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes a card owned by the user', async () => {
      const existingCard = Object.assign(new Card(), { id: 'card-1', userId });
      repository.findById.mockResolvedValue(existingCard);

      await service.remove(userId, 'card-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.remove).toHaveBeenCalledWith(existingCard);
    });

    it('throws when the card belongs to another user', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(new Card(), { id: 'card-1', userId: 'someone-else' }),
      );

      await expect(service.remove(userId, 'card-1')).rejects.toThrow(
        CardNotFoundException,
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthTokenPayload } from '../../../authentications/domain/ports/token-generator';
import { CurrentUser } from '../../../authentications/infrastructure/http/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../authentications/infrastructure/http/guards/jwt-auth.guard';
import { CardsService } from '../../application/cards.service';
import { CreateCardDto } from '../../application/dto/create-card.dto';
import { UpdateCardDto } from '../../application/dto/update-card.dto';
import { CardResponseDto } from './dto/card-response.dto';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Body() dto: CreateCardDto,
  ): Promise<CardResponseDto> {
    const card = await this.cardsService.create(currentUser.sub, dto);
    return new CardResponseDto(card);
  }

  @Get()
  async findAll(
    @CurrentUser() currentUser: AuthTokenPayload,
  ): Promise<CardResponseDto[]> {
    const cards = await this.cardsService.findAll(currentUser.sub);
    return cards.map((card) => new CardResponseDto(card));
  }

  @Patch(':id')
  async update(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    const card = await this.cardsService.update(currentUser.sub, id, dto);
    return new CardResponseDto(card);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.cardsService.remove(currentUser.sub, id);
  }
}

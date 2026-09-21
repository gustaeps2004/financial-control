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
import { CreateCategoryDto } from '../../application/dto/create-category.dto';
import { UpdateCategoryDto } from '../../application/dto/update-category.dto';
import { CategoriesService } from '../../application/categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.create(currentUser.sub, dto);
    return new CategoryResponseDto(category);
  }

  @Get()
  async findAll(
    @CurrentUser() currentUser: AuthTokenPayload,
  ): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.findAll(currentUser.sub);
    return categories.map((category) => new CategoryResponseDto(category));
  }

  @Patch(':id')
  async rename(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.rename(
      currentUser.sub,
      id,
      dto,
    );
    return new CategoryResponseDto(category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() currentUser: AuthTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.categoriesService.remove(currentUser.sub, id);
  }
}

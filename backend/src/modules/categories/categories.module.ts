import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationsModule } from '../authentications/authentications.module';
import { CategoriesService } from './application/categories.service';
import { CategoriesRepository } from './domain/repositories/categories.repository';
import { CategoryEntity } from './infrastructure/persistence/entities/category.entity';
import { CategoriesController } from './infrastructure/http/categories.controller';
import { TypeOrmCategoriesRepository } from './infrastructure/persistence/typeorm-categories.repository';

@Module({
  imports: [AuthenticationsModule, TypeOrmModule.forFeature([CategoryEntity])],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    { provide: CategoriesRepository, useClass: TypeOrmCategoriesRepository },
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}

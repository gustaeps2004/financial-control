import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntityConfig } from './config/base-entity.config';

export abstract class EntityBase {
  @PrimaryGeneratedColumn('uuid', BaseEntityConfig.id)
  id!: string;

  @CreateDateColumn(BaseEntityConfig.createdAt)
  createdAt!: Date;

  @UpdateDateColumn(BaseEntityConfig.updatedAt)
  updatedAt!: Date;

  @DeleteDateColumn(BaseEntityConfig.deletedAt)
  deletedAt: Date | null = null;
}

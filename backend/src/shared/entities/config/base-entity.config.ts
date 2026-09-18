import { ColumnOptions } from 'typeorm';

export class BaseEntityConfig {
  static readonly id: ColumnOptions = {
    name: 'id',
  };

  static readonly createdAt: ColumnOptions = {
    name: 'created_at',
    type: 'timestamptz',
  };

  static readonly updatedAt: ColumnOptions = {
    name: 'updated_at',
    type: 'timestamptz',
  };

  static readonly deletedAt: ColumnOptions = {
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  };
}

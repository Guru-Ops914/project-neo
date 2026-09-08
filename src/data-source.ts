import { DataSource } from 'typeorm';

import { Product } from './entities/product.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionSnapshot } from './entities/transaction-snapshot.entity';
import { CatalogueProduct } from './catalogue/entities/catalogue-product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'project_neo',

  entities: [
    Product,
    Transaction,
    TransactionSnapshot,
    CatalogueProduct,
  ],

  migrations: ['src/migrations/*.ts'],

  synchronize: false,
});
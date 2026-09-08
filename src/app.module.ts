import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TransactionsModule } from './transactions/transactions.module';
import { CatalogueModule } from './catalogue/catalogue.module';

import { Product } from './entities/product.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionSnapshot } from './entities/transaction-snapshot.entity';

import { CatalogueProduct } from './catalogue/entities/catalogue-product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
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

      synchronize: false,
    }),

    TransactionsModule,
    CatalogueModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

import { Product } from '../entities/product.entity';
import { Transaction } from '../entities/transaction.entity';
import { TransactionSnapshot } from '../entities/transaction-snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Transaction,
      TransactionSnapshot,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
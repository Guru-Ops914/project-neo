import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { Transaction } from '../entities/transaction.entity';
import { TransactionSnapshot } from '../entities/transaction-snapshot.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(TransactionSnapshot)
    private readonly snapshotRepository: Repository<TransactionSnapshot>,
  ) {}

  // GET PRODUCTS
  async getProducts() {
    return await this.productRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  // GET ALL TRANSACTIONS
  async getTransactions() {
    return await this.transactionRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }

  // GET ONE TRANSACTION
  async getTransactionById(id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const snapshot = await this.snapshotRepository.findOne({
      where: {
        transactionId: id,
      },
    });

    return {
      ...transaction,
      snapshot: snapshot
        ? {
            price: Number(snapshot.previousPrice),
          }
        : null,
    };
  }

  // GENERATE T001, T002, T003...
  private async generateTransactionId(): Promise<string> {
    const transactions = await this.transactionRepository.find({
      select: {
        id: true,
      },
    });

    let maxNumber = 0;

    for (const transaction of transactions) {
      const number = parseInt(
        transaction.id.replace('T', ''),
        10,
      );

      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }

    return `T${String(maxNumber + 1).padStart(3, '0')}`;
  }

  // PRICE UPDATE
  async updatePrice(sku: string, newPrice: number) {
    if (
      newPrice === undefined ||
      newPrice === null ||
      isNaN(Number(newPrice))
    ) {
      throw new BadRequestException('Invalid price');
    }

    const product = await this.productRepository.findOne({
      where: { sku },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const oldPrice = Number(product.price);
    const finalNewPrice = Number(newPrice);

    const transactionId =
      await this.generateTransactionId();

    // 1. Create transaction
    const transaction =
      this.transactionRepository.create({
        id: transactionId,
        operation: 'PRICE_UPDATE',
        sku: product.sku,
        oldPrice: oldPrice,
        newPrice: finalNewPrice,
        status: 'APPLIED',
        referenceTransactionId: null,
        restoredPrice: null,
        rollbackAt: null,
      });

    await this.transactionRepository.save(transaction);

    // 2. Save previous state as snapshot
    const snapshot = this.snapshotRepository.create({
      transactionId: transaction.id,
      sku: product.sku,
      previousPrice: oldPrice,
    });

    await this.snapshotRepository.save(snapshot);

    // 3. Apply new price
    product.price = finalNewPrice;

    await this.productRepository.save(product);

    return {
      id: transaction.id,
      operation: transaction.operation,
      sku: transaction.sku,
      oldPrice: Number(transaction.oldPrice),
      newPrice: Number(transaction.newPrice),
      snapshot: {
        price: oldPrice,
      },
      status: transaction.status,
      createdAt: transaction.createdAt,
    };
  }

  // ROLLBACK / UNDO
  async rollback(transactionId: string) {
    // 1. Find original transaction
    const originalTransaction =
      await this.transactionRepository.findOne({
        where: {
          id: transactionId,
        },
      });

    if (!originalTransaction) {
      throw new NotFoundException(
        'Transaction not found',
      );
    }

    if (originalTransaction.operation !== 'PRICE_UPDATE') {
      throw new BadRequestException(
        'Only price update transactions can be rolled back',
      );
    }

    if (originalTransaction.status === 'ROLLED_BACK') {
      return {
        message: 'Transaction already rolled back',
      };
    }

    // 2. Find snapshot
    const snapshot =
      await this.snapshotRepository.findOne({
        where: {
          transactionId: originalTransaction.id,
        },
      });

    if (!snapshot) {
      throw new NotFoundException(
        'Snapshot not found',
      );
    }

    // 3. Find product
    const product =
      await this.productRepository.findOne({
        where: {
          sku: originalTransaction.sku,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const currentPrice = Number(product.price);
    const restoredPrice = Number(
      snapshot.previousPrice,
    );

    // 4. Restore old price
    product.price = restoredPrice;

    await this.productRepository.save(product);

    // 5. Mark original transaction rolled back
    originalTransaction.status = 'ROLLED_BACK';
    originalTransaction.rollbackAt = new Date();

    await this.transactionRepository.save(
      originalTransaction,
    );

    // 6. Create separate rollback transaction
    const rollbackId =
      await this.generateTransactionId();

    const rollbackTransaction =
      this.transactionRepository.create({
        id: rollbackId,
        operation: 'ROLLBACK',
        sku: product.sku,
        oldPrice: currentPrice,
        newPrice: null,
        status: 'APPLIED',
        referenceTransactionId:
          originalTransaction.id,
        restoredPrice: restoredPrice,
        rollbackAt: new Date(),
      });

    await this.transactionRepository.save(
      rollbackTransaction,
    );

    return {
      id: rollbackTransaction.id,
      operation: 'ROLLBACK',
      referenceTransactionId:
        originalTransaction.id,
      sku: product.sku,
      oldPrice: currentPrice,
      restoredPrice: restoredPrice,
      status: 'APPLIED',
      createdAt: rollbackTransaction.createdAt,
    };
  }
}
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('products')
  getProducts() {
    return this.transactionsService.getProducts();
  }

  @Get()
  getTransactions() {
    return this.transactionsService.getTransactions();
  }

  @Get(':id')
  getTransactionById(@Param('id') id: string) {
    return this.transactionsService.getTransactionById(id);
  }

  @Post('price-update')
  updatePrice(
    @Body() body: { sku: string; newPrice: number },
  ) {
    return this.transactionsService.updatePrice(
      body.sku,
      body.newPrice,
    );
  }

  @Post(':id/rollback')
  rollback(@Param('id') id: string) {
    return this.transactionsService.rollback(id);
  }
}
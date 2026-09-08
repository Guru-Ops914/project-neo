import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CatalogueService } from './catalogue.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('catalogue')
export class CatalogueController {
  constructor(
    private readonly catalogueService: CatalogueService,
  ) {}

  @Post('products')
  create(
    @Body() createProductDto: CreateProductDto,
  ) {
    // TEMPORARY until we connect the project's authentication.
    const userId = '11111111-1111-1111-1111-111111111111';

    return this.catalogueService.create(
      userId,
      createProductDto,
    );
  }

  @Get('products')
  findAll(
    @Query('category') category?: string,
  ) {
    const userId = '11111111-1111-1111-1111-111111111111';

    return this.catalogueService.findAll(
      userId,
      category,
    );
  }

  @Get('references')
  findReferences(
    @Query('category') category: string,
  ) {
    const userId = '11111111-1111-1111-1111-111111111111';

    return this.catalogueService.findReferences(
      userId,
      category,
    );
  }

  @Get('products/:id')
  findOne(
    @Param('id') id: string,
  ) {
    const userId = '11111111-1111-1111-1111-111111111111';

    return this.catalogueService.findOne(
      userId,
      id,
    );
  }

  @Patch('products/:id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const userId = '11111111-1111-1111-1111-111111111111';

    return this.catalogueService.update(
      userId,
      id,
      updateProductDto,
    );
  }

  @Delete('products/:id')
  remove(
    @Param('id') id: string,
  ) {
    const userId = '11111111-1111-1111-1111-111111111111';

    return this.catalogueService.remove(
      userId,
      id,
    );
  }
}
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CatalogueProduct } from './entities/catalogue-product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class CatalogueService {
  constructor(
    @InjectRepository(CatalogueProduct)
    private readonly catalogueRepository: Repository<CatalogueProduct>,
  ) {}

  /*
   * CREATE PRODUCT
   */
  async create(
    userId: string,
    createProductDto: CreateProductDto,
  ) {
    const existingProduct =
      await this.catalogueRepository.findOne({
        where: {
          userId,
          sku: createProductDto.sku,
        },
      });

    if (existingProduct) {
      throw new ConflictException(
        'A product with this SKU already exists',
      );
    }

    const product =
      this.catalogueRepository.create({
        ...createProductDto,

        // Never take userId from frontend.
        userId,

        attributes:
          createProductDto.attributes ?? {},

        images:
          createProductDto.images ?? [],
      });

    return this.catalogueRepository.save(product);
  }

  /*
   * GET ALL PRODUCTS OF LOGGED-IN SELLER
   */
  async findAll(
    userId: string,
    category?: string,
  ) {
    const query =
      this.catalogueRepository
        .createQueryBuilder('product')
        .where('product.userId = :userId', {
          userId,
        });

    if (category) {
      query.andWhere(
        'LOWER(product.category) = LOWER(:category)',
        {
          category,
        },
      );
    }

    query.orderBy(
      'product.createdAt',
      'DESC',
    );

    return query.getMany();
  }

  /*
   * GET ONE PRODUCT
   *
   * Notice we search using BOTH id + userId.
   *
   * This prevents:
   * Seller A requesting Seller B's product UUID.
   */
  async findOne(
    userId: string,
    id: string,
  ) {
    const product =
      await this.catalogueRepository.findOne({
        where: {
          id,
          userId,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Catalogue product not found',
      );
    }

    return product;
  }

  /*
   * UPDATE PRODUCT
   */
  async update(
    userId: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product =
      await this.findOne(userId, id);

    if (
      updateProductDto.sku &&
      updateProductDto.sku !== product.sku
    ) {
      const duplicate =
        await this.catalogueRepository.findOne({
          where: {
            userId,
            sku: updateProductDto.sku,
          },
        });

      if (duplicate) {
        throw new ConflictException(
          'A product with this SKU already exists',
        );
      }
    }

    Object.assign(
      product,
      updateProductDto,
    );

    return this.catalogueRepository.save(
      product,
    );
  }

  /*
   * DELETE PRODUCT
   */
  async remove(
    userId: string,
    id: string,
  ) {
    const product =
      await this.findOne(userId, id);

    await this.catalogueRepository.remove(
      product,
    );

    return {
      success: true,
      message:
        'Catalogue product deleted successfully',
      id,
    };
  }

  /*
   * GET REFERENCE PRODUCTS
   *
   * Sahil's AI Autofill can call this.
   */
  async findReferences(
    userId: string,
    category: string,
  ) {
    return this.catalogueRepository.find({
      where: {
        userId,
        category,
      },
      order: {
        updatedAt: 'DESC',
      },
      take: 20,
    });
  }
}
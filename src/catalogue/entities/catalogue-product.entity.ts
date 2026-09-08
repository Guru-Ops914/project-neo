import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('catalogue_products')
@Index(['userId'])
@Index(['userId', 'category'])
@Index(['userId', 'sku'], { unique: true })
export class CatalogueProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /*
   * IMPORTANT:
   * This must come from the authenticated user/session.
   * Never accept this from request body.
   */
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 150 })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 150 })
  category: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'jsonb',
    default: {},
  })
  attributes: Record<string, any>;

  /*
   * Example:
   * [
   *   "users/USER_ID/catalogue/PRODUCT_ID/image-1.jpg"
   * ]
   */
  @Column({
    type: 'jsonb',
    default: [],
  })
  images: string[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  marketplace?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
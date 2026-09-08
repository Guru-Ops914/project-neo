import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryColumn()
  id: string;

  @Column()
  operation: string;

  @Column()
  sku: string;

  @Column('numeric', {
    name: 'old_price',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  oldPrice: number | null;

  @Column('numeric', {
    name: 'new_price',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  newPrice: number | null;

  @Column()
  status: string;

  @Column({
  name: 'reference_transaction_id',
  type: 'varchar',
  length: 50,
  nullable: true,
})
referenceTransactionId: string | null;

  @Column('numeric', {
    name: 'restored_price',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  restoredPrice: number | null;

  @Column({ 
    name: 'rollback_at', 
    type: 'timestamp',
    nullable: true 
  })
  rollbackAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
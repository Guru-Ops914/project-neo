import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('transaction_snapshots')
export class TransactionSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Column()
  sku: string;

  @Column('numeric', {
    name: 'previous_price',
    precision: 10,
    scale: 2,
  })
  previousPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
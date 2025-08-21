import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Listing } from './listing.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column()
  imageUrl: string;

  @Column({ default: false })
  isPrimary: boolean;
}

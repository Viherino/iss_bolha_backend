import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column() // Make firstName non-nullable as it will be required in the form
  firstName: string;

  @Column() // Make lastName non-nullable as it will be required in the form
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn()
  registrationDate: Date;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: false })
  isVerified: boolean;
}

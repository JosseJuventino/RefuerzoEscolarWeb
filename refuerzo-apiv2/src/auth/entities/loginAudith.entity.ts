import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
} from 'typeorm';

import { ObjectId } from 'mongodb';

@Entity('login_audit')
export class LoginAudit {

  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  email: string;

  @Column()
  device: string;

  @Column()
  browser: string;

  @Column({ nullable: true })
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  expired: boolean;
}

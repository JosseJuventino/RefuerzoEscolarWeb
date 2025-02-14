// document.entity.ts
import { ObjectId } from 'mongodb';
import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Documents')
export class Document {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  originalFilename: string;

  @Column()
  storedFilename: string; // Nombre único en el servidor

  @Column()
  category: string;

  @Column()
  url: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

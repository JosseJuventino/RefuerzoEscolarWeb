import { ObjectId } from 'mongodb';
import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Images')
export class Image {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  originalFilename: string;

  @Column()
  storedFilename: string;

  @Column()
  optimizedFilename: string;

  @Column()
  webpFilename: string;

  @Column()
  category: string;

  @Column()
  url: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

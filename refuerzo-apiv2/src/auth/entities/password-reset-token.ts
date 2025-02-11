import { Entity, Column, ObjectIdColumn } from 'typeorm';

@Entity()
export class PasswordResetToken {
  @ObjectIdColumn()
  _id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;
}
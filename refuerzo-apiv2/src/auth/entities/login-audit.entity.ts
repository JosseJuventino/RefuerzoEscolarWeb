import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class LoginAudit {
@PrimaryGeneratedColumn()
id: number;

@Column()
userId: number;

@Column()
ipAddress: string;

@Column()
userAgent: string;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
loginAt: Date;
}


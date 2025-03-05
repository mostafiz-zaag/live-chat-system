import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Agent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    agentId: string;

    @Column({ default: 'ready' })
    status: 'ready' | 'busy'; // Agent status
}

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity()
export class Stuff {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 200
    })
    @Length(1, 200)
    name: string;

    @Column({
        length: 4096,
        nullable: true
    })
    @Length(0, 4096)
    desc: string;
}

export const stuffSchema = {
    id: { type: 'number', required: true, example: 1 },
    name: { type: 'string', required: true, example: '纯净水' },
    desc: { type: 'string', required: false, example: '纯净水' }
};
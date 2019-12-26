import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 200
    })
    @Length(2, 200)
    name: string;

    @Column({
        length: 4096,
        nullable: true
    })
    @Length(0, 4096)
    desc: string;
}

export const projectSchema = {
    id: { type: 'number', required: true, example: 1 },
    name: { type: 'string', required: true, example: '废水处理' },
    desc: { type: 'string', required: false, example: '废水处理项目简介' }
};
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EstadoInscripcion } from '../common/enums';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';


@Entity('inscripciones')
@Unique('UQ_inscripcion_torneo_equipo', ['torneoId', 'equipoId'])
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, (torneo) => torneo.inscripciones, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'torneoId' })
  torneo: Torneo;

  @Column()
  torneoId: number;

  @ManyToOne(() => Equipo, (equipo) => equipo.inscripciones, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'equipoId' })
  equipo: Equipo;

  @Column()
  equipoId: number;

  @CreateDateColumn()
  fecha: Date;

  @Column({ type: 'enum', enum: EstadoInscripcion, default: EstadoInscripcion.PENDIENTE })
  estado: EstadoInscripcion;
}

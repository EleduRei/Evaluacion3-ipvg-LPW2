import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoPartido } from '../common/enums';
import { Torneo } from '../torneos/torneo.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Resultado } from '../resultados/resultado.entity';

@Entity('partidos')
export class Partido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, (torneo) => torneo.partidos, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'torneoId' })
  torneo: Torneo;

  @Column()
  torneoId: number;

  @ManyToOne(() => Equipo, { nullable: false })
  @JoinColumn({ name: 'equipoLocalId' })
  equipoLocal: Equipo;

  @Column()
  equipoLocalId: number;

  @ManyToOne(() => Equipo, { nullable: false })
  @JoinColumn({ name: 'equipoVisitanteId' })
  equipoVisitante: Equipo;

  @Column()
  equipoVisitanteId: number;

  @Column({ type: 'datetime' })
  fechaHora: Date;

  @Column({ length: 40 })
  ronda: string;

  @Column({ type: 'enum', enum: EstadoPartido, default: EstadoPartido.PROGRAMADO })
  estado: EstadoPartido;

  // Partido (1) -> (1) Resultado (la FK está en la tabla resultados)
  @OneToOne(() => Resultado, (resultado) => resultado.partido)
  resultado: Resultado | null;
}

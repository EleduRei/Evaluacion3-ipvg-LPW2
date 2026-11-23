import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partido } from '../partidos/partido.entity';
import { Equipo } from '../equipos/equipo.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('resultados')
export class Resultado {
  @PrimaryGeneratedColumn()
  id: number;

  // OneToOne + JoinColumn => la FK partidoId queda UNIQUE: un solo resultado por partido
  @OneToOne(() => Partido, (partido) => partido.resultado, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'partidoId' })
  partido: Partido;

  @Column()
  partidoId: number;

  @Column({ type: 'int' })
  puntajeLocal: number;

  @Column({ type: 'int' })
  puntajeVisitante: number;

  // null = empate. Se calcula en el servicio a partir de los puntajes (no se ingresa a mano).
  @ManyToOne(() => Equipo, { nullable: true })
  @JoinColumn({ name: 'ganadorId' })
  ganador: Equipo | null;

  @Column({ type: 'int', nullable: true })
  ganadorId: number | null;

  // Administrador que registró el resultado oficial
  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'registradoPorId' })
  registradoPor: Usuario;

  @Column()
  registradoPorId: number;

  @CreateDateColumn()
  registradoEn: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoEquipo } from '../common/enums';
import { Usuario } from '../usuarios/usuario.entity';
import { Inscripcion } from '../inscripciones/inscripcion.entity';

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80, unique: true })
  nombre: string;

  @Column({ length: 80 })
  juegoPreferido: string;

  @Column({ type: 'enum', enum: EstadoEquipo, default: EstadoEquipo.ACTIVO })
  estado: EstadoEquipo;

  // Muchos equipos pueden tener al mismo usuario como capitán
  @ManyToOne(() => Usuario, (usuario) => usuario.equiposCapitaneados, { nullable: false })
  @JoinColumn({ name: 'capitanId' })
  capitan: Usuario;

  @Column()
  capitanId: number;

  // Tabla intermedia equipo_integrantes (equipoId, usuarioId)
  @ManyToMany(() => Usuario, (usuario) => usuario.equipos)
  @JoinTable({
    name: 'equipo_integrantes',
    joinColumn: { name: 'equipoId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'usuarioId', referencedColumnName: 'id' },
  })
  integrantes: Usuario[];

  // Equipo <-> Torneo se relaciona a través de Inscripcion
  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.equipo)
  inscripciones: Inscripcion[];

  @CreateDateColumn()
  creadoEn: Date;
}

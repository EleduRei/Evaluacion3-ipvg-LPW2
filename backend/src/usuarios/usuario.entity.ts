import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rol } from '../common/enums';
import { Equipo } from '../equipos/equipo.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 40, unique: true })
  alias: string;

  @Column({ length: 120, unique: true })
  correo: string;

  // Hash bcrypt. select:false => nunca se devuelve en las consultas normales.
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.ESTUDIANTE })
  rol: Rol;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  creadoEn: Date;

  // Usuario (1) -> (N) Equipo, como capitán
  @OneToMany(() => Equipo, (equipo) => equipo.capitan)
  equiposCapitaneados: Equipo[];

  // Usuario (N) <-> (N) Equipo, como integrante
  @ManyToMany(() => Equipo, (equipo) => equipo.integrantes)
  equipos: Equipo[];
}

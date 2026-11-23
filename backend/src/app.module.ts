import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EquiposModule } from './equipos/equipos.module';
import { TorneosModule } from './torneos/torneos.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { PartidosModule } from './partidos/partidos.module';
import { ResultadosModule } from './resultados/resultados.module';

@Module({
  imports: [
    // Lee el archivo .env y deja las variables disponibles en ConfigService
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MySQL con TypeORM usando variables de entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 3306)),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME', 'gamehub_ipvg'),
        autoLoadEntities: true, // registra las entidades de cada forFeature()
        synchronize: config.get('DB_SYNC') === 'true', // solo desarrollo
      }),
    }),

    AuthModule,
    UsuariosModule,
    EquiposModule,
    TorneosModule,
    InscripcionesModule,
    PartidosModule,
    ResultadosModule,
  ],
})
export class AppModule {}

import { ObjectId } from 'mongodb';
import {
  Collection,
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

class Asistencia_Alumnos {
  @Column()
  alumnoId: string;

  @Column()
  fecha: Date;

  @Column()
  estado: string;
}

class Asistencia_Encargados {
  @Column()
  userId: string;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column()
  estado: string;

  @Column({ type: 'timestamp' })
  hora_inicio: Date;

  @Column({ type: 'timestamp' })
  hora_fin: Date;
}

@Entity('Asistencia')
@Unique(['seccionId'])
export class Asistencia {
  @ObjectIdColumn()
  _id: ObjectId;

  //Solamente 1 por seccion
  @Column()
  seccionId: string;

  @Column()
  alumnos: Asistencia_Alumnos[];

  @Column()
  encargados: Asistencia_Encargados[];
}

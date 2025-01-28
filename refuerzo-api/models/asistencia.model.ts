import { Schema, model, Document } from "mongoose";

interface IAsistencia extends Document {
  seccion: Schema.Types.ObjectId;
  estudiante: Schema.Types.ObjectId;
  fecha: Date;
  horaAsistencia: Date;
  presente: boolean;
}

//ESTE NO

const asistenciaSchema = new Schema<IAsistencia>({
  seccion: {
    type: Schema.Types.ObjectId,
    ref: "Seccion",
    required: true,
  },
  estudiante: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now,
  },
  horaAsistencia: {
    type: Date,
    required: true,
    default: Date.now,
  },
  presente: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default model<IAsistencia>("Asistencia", asistenciaSchema);

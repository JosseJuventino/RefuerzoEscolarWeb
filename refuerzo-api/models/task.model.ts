import { Schema, model, Document } from "mongoose";

interface ITarea extends Document {
  seccion: Schema.Types.ObjectId;
  descripcion: string;
  fechaAsignacion: Date;
  fechaEntrega: Date;
}

const tareaSchema = new Schema<ITarea>({
  seccion: {
    type: Schema.Types.ObjectId,
    ref: "Seccion",
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  fechaAsignacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
  fechaEntrega: {
    type: Date,
    required: true,
  },
});

export default model<ITarea>("Tarea", tareaSchema);

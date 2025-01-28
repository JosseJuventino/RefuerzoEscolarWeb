import { Schema, model, Document } from "mongoose";

interface INotaTarea extends Document {
  tarea: Schema.Types.ObjectId;
  estudiante: Schema.Types.ObjectId;
  nota: number;
  comentarios?: string;
}

//ESTE NO

const notaTareaSchema = new Schema<INotaTarea>({
  tarea: {
    type: Schema.Types.ObjectId,
    ref: "Tarea",
    required: true,
  },
  estudiante: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  nota: {
    type: Number,
    required: true,
    min: 0,
  },
  comentarios: {
    type: String,
    required: false,
  },
});

export default model<INotaTarea>("NotaTarea", notaTareaSchema);

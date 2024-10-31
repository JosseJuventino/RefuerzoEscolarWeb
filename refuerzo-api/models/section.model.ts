import { Schema, model, Document } from "mongoose";

interface ISeccion extends Document {
  nombre: string;
  año: number;
  instructor: Schema.Types.ObjectId;
  estado: string;
  estudiantes: Schema.Types.ObjectId[]; 
}

const seccionSchema = new Schema<ISeccion>({
  nombre: {
    type: String,
    required: true,
  },
  año: {
    type: Number,
    required: true,
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  estado: {
    type: String,
    enum: ["Activa", "Inactiva"],
    required: true,
    default: "Activa",
  },
  estudiantes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
});

export default model<ISeccion>("Seccion", seccionSchema);

import { Schema, model, Document } from "mongoose";

interface IPostulante extends Document {
  nombre: string;
  email: string;
  año: number;
  estado: string;
  fechaEnvio: Date;
}

const postulanteSchema = new Schema<IPostulante>({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  año: {
    type: Number,
    required: true,
  },
  estado: {
    type: String,
    enum: ["Pendiente", "Aprobado", "Rechazado"],
    required: true,
    default: "Pendiente",
  },
  fechaEnvio: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default model<IPostulante>("Postulante", postulanteSchema);

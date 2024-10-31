import { Schema, model, Document } from "mongoose";

interface IUsuario extends Document {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: Schema.Types.ObjectId;
}

const usuarioSchema = new Schema<IUsuario>({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: Schema.Types.ObjectId,
    ref: "Rol",
    required: true,
  },
});

export default model<IUsuario>("Usuario", usuarioSchema);

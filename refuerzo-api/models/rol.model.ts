import { Schema, model, Document } from "mongoose";

export interface IRol extends Document {
  nombre: string;
}

const rolSchema = new Schema<IRol>({
  nombre: {
    type: String,
    required: true,
    unique: true,
  },
});

export default model<IRol>("Rol", rolSchema);

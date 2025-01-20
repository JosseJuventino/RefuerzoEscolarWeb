"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postulanteSchema = new mongoose_1.Schema({
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
exports.default = (0, mongoose_1.model)("Postulante", postulanteSchema);

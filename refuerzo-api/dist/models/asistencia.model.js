"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const asistenciaSchema = new mongoose_1.Schema({
    seccion: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Seccion",
        required: true,
    },
    estudiante: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = (0, mongoose_1.model)("Asistencia", asistenciaSchema);

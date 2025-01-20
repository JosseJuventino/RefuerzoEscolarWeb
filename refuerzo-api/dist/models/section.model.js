"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const seccionSchema = new mongoose_1.Schema({
    nombre: {
        type: String,
        required: true,
    },
    año: {
        type: Number,
        required: true,
    },
    instructor: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Usuario",
        },
    ],
});
exports.default = (0, mongoose_1.model)("Seccion", seccionSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tareaSchema = new mongoose_1.Schema({
    seccion: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = (0, mongoose_1.model)("Tarea", tareaSchema);

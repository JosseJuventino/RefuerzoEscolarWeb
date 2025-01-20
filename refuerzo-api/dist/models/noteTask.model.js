"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notaTareaSchema = new mongoose_1.Schema({
    tarea: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tarea",
        required: true,
    },
    estudiante: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = (0, mongoose_1.model)("NotaTarea", notaTareaSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asistenciaInParams = exports.createAsistenciaValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createAsistenciaValidator = [
    (0, express_validator_1.body)("seccion")
        .isMongoId()
        .withMessage("La sección debe ser un ID de MongoDB válido"),
    (0, express_validator_1.body)("estudiante")
        .isMongoId()
        .withMessage("El estudiante debe ser un ID de MongoDB válido"),
    (0, express_validator_1.body)("fecha")
        .optional()
        .isISO8601()
        .withMessage("La fecha debe ser una fecha válida"),
    (0, express_validator_1.body)("horaAsistencia")
        .optional()
        .isISO8601()
        .withMessage("La hora de asistencia debe ser una hora válida"),
    (0, express_validator_1.body)("presente")
        .isBoolean()
        .withMessage("Presente debe ser un valor booleano"),
];
exports.asistenciaInParams = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("El ID de la asistencia es requerido")
        .isMongoId()
        .withMessage("El ID debe ser un ID de MongoDB válido"),
];

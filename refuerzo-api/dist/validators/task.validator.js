"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tareaInParams = exports.createTareaValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createTareaValidator = [
    (0, express_validator_1.body)("seccion")
        .isMongoId()
        .withMessage("La sección debe ser un ID de MongoDB válido"),
    (0, express_validator_1.body)("descripcion")
        .isString()
        .withMessage("La descripción es requerida y debe ser una cadena"),
    (0, express_validator_1.body)("fechaAsignacion")
        .optional()
        .isISO8601()
        .withMessage("La fecha de asignación debe ser una fecha válida"),
    (0, express_validator_1.body)("fechaEntrega")
        .isISO8601()
        .withMessage("La fecha de entrega es requerida y debe ser una fecha válida"),
];
exports.tareaInParams = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("El ID de la tarea es requerido")
        .isMongoId()
        .withMessage("El ID debe ser un ID de MongoDB válido"),
];

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notaTareaInParams = exports.createNotaTareaValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createNotaTareaValidator = [
    (0, express_validator_1.body)("tarea")
        .isMongoId()
        .withMessage("La tarea debe ser un ID de MongoDB válido"),
    (0, express_validator_1.body)("estudiante")
        .isMongoId()
        .withMessage("El estudiante debe ser un ID de MongoDB válido"),
    (0, express_validator_1.body)("nota")
        .isFloat({ min: 0 })
        .withMessage("La nota es requerida y debe ser un número mayor o igual a 0"),
    (0, express_validator_1.body)("comentarios")
        .optional()
        .isString()
        .withMessage("Los comentarios deben ser una cadena de texto"),
];
exports.notaTareaInParams = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("El ID de la nota es requerido")
        .isMongoId()
        .withMessage("El ID debe ser un ID de MongoDB válido"),
];

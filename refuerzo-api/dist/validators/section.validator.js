"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seccionInParams = exports.createSeccionValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createSeccionValidator = [
    (0, express_validator_1.body)("nombre")
        .isString()
        .withMessage("El nombre de la sección es requerido y debe ser una cadena"),
    (0, express_validator_1.body)("año")
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage("El año es requerido y debe ser un número entero válido"),
    (0, express_validator_1.body)("instructor")
        .isMongoId()
        .withMessage("El ID del instructor debe ser un ID de MongoDB válido"),
    (0, express_validator_1.body)("estado")
        .isIn(["Activa", "Inactiva"])
        .withMessage("El estado debe ser 'Activa' o 'Inactiva'"),
    (0, express_validator_1.body)("estudiantes")
        .isArray()
        .withMessage("Estudiantes debe ser un arreglo de IDs válidos"),
    (0, express_validator_1.body)("estudiantes.*")
        .isMongoId()
        .withMessage("Cada estudiante debe ser un ID de MongoDB válido"),
];
exports.seccionInParams = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("El ID de la sección es requerido")
        .isMongoId()
        .withMessage("El ID debe ser un ID de MongoDB válido"),
];

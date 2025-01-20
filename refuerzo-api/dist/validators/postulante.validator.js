"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postulanteInParams = exports.createPostulanteValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createPostulanteValidator = [
    (0, express_validator_1.body)("nombre")
        .isString()
        .withMessage("El nombre es requerido y debe ser una cadena"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Debe proporcionar un correo electrónico válido"),
    (0, express_validator_1.body)("año")
        .isInt({ min: 1900 })
        .withMessage("El año es requerido y debe ser un número entero válido"),
    (0, express_validator_1.body)("estado")
        .isIn(["Pendiente", "Aprobado", "Rechazado"])
        .withMessage("El estado debe ser Pendiente, Aprobado o Rechazado"),
];
exports.postulanteInParams = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("El ID del postulante es requerido")
        .isMongoId()
        .withMessage("El ID debe ser un ID de MongoDB válido"),
];

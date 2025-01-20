"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolInParams = exports.createRolValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createRolValidator = [
    (0, express_validator_1.body)("nombre")
        .isString()
        .withMessage("El nombre del rol es requerido y debe ser una cadena"),
];
exports.rolInParams = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("El ID del rol es requerido")
        .isMongoId()
        .withMessage("El ID debe ser un ID de MongoDB válido"),
];

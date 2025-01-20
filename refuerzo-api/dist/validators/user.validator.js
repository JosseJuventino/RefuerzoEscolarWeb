"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioInParams = exports.createUsuarioValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createUsuarioValidator = [
    (0, express_validator_1.body)("nombre")
        .isString()
        .withMessage("El nombre es requerido y debe ser una cadena"),
    (0, express_validator_1.body)("apellido")
        .isString()
        .withMessage("El apellido es requerido y debe ser una cadena"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Debe proporcionar un correo electrónico válido"),
    (0, express_validator_1.body)("password")
        .isString()
        .withMessage("La contraseña es requerida y debe ser una cadena"),
    (0, express_validator_1.body)("rol")
        .isMongoId()
        .withMessage("El rol debe ser un ID de MongoDB válido"),
];
exports.usuarioInParams = [
    (0, express_validator_1.param)("id")
        .notEmpty()
        .withMessage("El ID del usuario es requerido")
        .isMongoId()
        .withMessage("El ID debe ser un ID de MongoDB válido"),
];

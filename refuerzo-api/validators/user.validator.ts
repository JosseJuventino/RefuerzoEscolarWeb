import { body, param } from "express-validator";

export const createUsuarioValidator = [
  body("nombre")
    .isString()
    .withMessage("El nombre es requerido y debe ser una cadena"),
  body("apellido")
    .isString()
    .withMessage("El apellido es requerido y debe ser una cadena"),
  body("email")
    .isEmail()
    .withMessage("Debe proporcionar un correo electrónico válido"),
  body("password")
    .isString()
    .withMessage("La contraseña es requerida y debe ser una cadena"),
  body("rol")
    .isMongoId()
    .withMessage("El rol debe ser un ID de MongoDB válido"),
];

export const usuarioInParams = [
  param("id")
    .notEmpty()
    .withMessage("El ID del usuario es requerido")
    .isMongoId()
    .withMessage("El ID debe ser un ID de MongoDB válido"),
];

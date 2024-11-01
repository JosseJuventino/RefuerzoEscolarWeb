import { body, param } from "express-validator";

export const createRolValidator = [
  body("nombre")
    .isString()
    .withMessage("El nombre del rol es requerido y debe ser una cadena"),
];

export const rolInParams = [
  param("id")
    .notEmpty()
    .withMessage("El ID del rol es requerido")
    .isMongoId()
    .withMessage("El ID debe ser un ID de MongoDB válido"),
];

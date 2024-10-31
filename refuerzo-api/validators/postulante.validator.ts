import { body, param } from "express-validator";

export const createPostulanteValidator = [
  body("nombre")
    .isString()
    .withMessage("El nombre es requerido y debe ser una cadena"),
  body("email")
    .isEmail()
    .withMessage("Debe proporcionar un correo electrónico válido"),
  body("año")
    .isInt({ min: 1900 })
    .withMessage("El año es requerido y debe ser un número entero válido"),
  body("estado")
    .isIn(["Pendiente", "Aprobado", "Rechazado"])
    .withMessage("El estado debe ser Pendiente, Aprobado o Rechazado"),
];

export const postulanteInParams = [
  param("id")
    .notEmpty()
    .withMessage("El ID del postulante es requerido")
    .isMongoId()
    .withMessage("El ID debe ser un ID de MongoDB válido"),
];

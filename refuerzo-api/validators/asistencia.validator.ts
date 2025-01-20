import { body, param } from "express-validator";

export const createAsistenciaValidator = [
  body("seccion")
    .isMongoId()
    .withMessage("La sección debe ser un ID de MongoDB válido"),
  body("estudiante")
    .isMongoId()
    .withMessage("El estudiante debe ser un ID de MongoDB válido"),
  body("fecha")
    .optional()
    .isISO8601()
    .withMessage("La fecha debe ser una fecha válida"),
  body("horaAsistencia")
    .optional()
    .isISO8601()
    .withMessage("La hora de asistencia debe ser una hora válida"),
  body("presente")
    .isBoolean()
    .withMessage("Presente debe ser un valor booleano"),
];

export const asistenciaInParams = [
  param("id")
    .notEmpty()
    .withMessage("El ID de la asistencia es requerido")
    .isMongoId()
    .withMessage("El ID debe ser un ID de MongoDB válido"),
];

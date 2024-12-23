import { body, param } from "express-validator";

export const createTareaValidator = [
  body("seccion")
    .isMongoId()
    .withMessage("La sección debe ser un ID de MongoDB válido"),
  body("descripcion")
    .isString()
    .withMessage("La descripción es requerida y debe ser una cadena"),
  body("fechaAsignacion")
    .optional()
    .isISO8601()
    .withMessage("La fecha de asignación debe ser una fecha válida"),
  body("fechaEntrega")
    .isISO8601()
    .withMessage(
      "La fecha de entrega es requerida y debe ser una fecha válida"
    ),
];

export const tareaInParams = [
  param("id")
    .notEmpty()
    .withMessage("El ID de la tarea es requerido")
    .isMongoId()
    .withMessage("El ID debe ser un ID de MongoDB válido"),
];

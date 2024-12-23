import { body, param } from "express-validator";

export const createSeccionValidator = [
  body("nombre")
    .isString()
    .withMessage("El nombre de la sección es requerido y debe ser una cadena"),
  body("año")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("El año es requerido y debe ser un número entero válido"),
  body("instructor")
    .isMongoId()
    .withMessage("El ID del instructor debe ser un ID de MongoDB válido"),
  body("estado")
    .isIn(["Activa", "Inactiva"])
    .withMessage("El estado debe ser 'Activa' o 'Inactiva'"),
  body("estudiantes")
    .isArray()
    .withMessage("Estudiantes debe ser un arreglo de IDs válidos"),
  body("estudiantes.*")
    .isMongoId()
    .withMessage("Cada estudiante debe ser un ID de MongoDB válido"),
];

export const seccionInParams = [
  param("id")
    .notEmpty()
    .withMessage("El ID de la sección es requerido")
    .isMongoId()
    .withMessage("El ID debe ser un ID de MongoDB válido"),
];

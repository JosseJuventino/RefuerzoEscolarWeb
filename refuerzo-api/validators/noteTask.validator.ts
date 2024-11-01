  import { body, param } from "express-validator";

  export const createNotaTareaValidator = [
    body("tarea")
      .isMongoId()
      .withMessage("La tarea debe ser un ID de MongoDB válido"),
    body("estudiante")
      .isMongoId()
      .withMessage("El estudiante debe ser un ID de MongoDB válido"),
    body("nota")
      .isFloat({ min: 0 })
      .withMessage("La nota es requerida y debe ser un número mayor o igual a 0"),
    body("comentarios")
      .optional()
      .isString()
      .withMessage("Los comentarios deben ser una cadena de texto"),
  ];

  export const notaTareaInParams = [
    param("id")
      .notEmpty()
      .withMessage("El ID de la nota es requerido")
      .isMongoId()
      .withMessage("El ID debe ser un ID de MongoDB válido"),
  ];

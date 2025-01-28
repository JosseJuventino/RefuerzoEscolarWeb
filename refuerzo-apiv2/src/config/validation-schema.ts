import * as Joi from 'joi';

// Expresión regular como constante
export const MONGO_URI_REGEX =
  /^mongodb(?:\+srv)?:\/\/(?:([^:\s]+):([^@\s]+)@)?[\w.-]+(?:\.\w+)+(?::\d+)?(?:\/[\w-]+)?(?:\?[\w=&-]+)?$/;

// Mensajes de error como constantes
export const errorMessages = {
  mongoUriInvalid:
    'The MongoDB URI is invalid. Ensure the format is correct, including user and password if present.',
  mongoUriRequired: 'MONGO_URI is a required field.',
  mongoDbRequired: 'MONGO_DB is a required field.',
};

// Esquema de validación
export const environmentValidations = Joi.object({
  MONGO_URI: Joi.string()
    .pattern(MONGO_URI_REGEX) // Usar la expresión regular constante
    .required()
    .messages({
      'string.pattern.base': errorMessages.mongoUriInvalid,
      'any.required': errorMessages.mongoUriRequired,
    }),
  MONGO_DB: Joi.string().required().messages({
    'any.required': errorMessages.mongoDbRequired,
  }),
});

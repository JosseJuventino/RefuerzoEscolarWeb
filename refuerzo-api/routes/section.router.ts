// src/routes/seccion.router.ts
import express from "express";
import {
  createSeccion,
  getAllSecciones,
  getSeccionById,
  updateSeccionById,
  deleteSeccionById,
  getSeccionesByYear,
} from "../controllers/section.controller";

import {
    createSeccionValidator,
    seccionInParams,
} from "../validators/section.validator";
import { runValidation } from "../middlewares/validator.middleware";

const router = express.Router();

router.post("/", createSeccionValidator, runValidation, createSeccion);
router.get("/", getAllSecciones);
router.get("/:id", seccionInParams, runValidation, getSeccionById);
router.put("/:id", seccionInParams, runValidation, updateSeccionById);
router.delete("/:id", seccionInParams, runValidation, deleteSeccionById);
router.get("/year/:año", runValidation, getSeccionesByYear);

export default router;

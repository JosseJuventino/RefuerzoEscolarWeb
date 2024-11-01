import express from "express";
import {
  createAsistencia,
  getAllAsistencias,
  getAsistenciaById,
  updateAsistenciaById,
  deleteAsistenciaById,
  getAsistenciasBySeccionAndFecha,
} from "../controllers/asistencia.controller";

import {
  createAsistenciaValidator,
  asistenciaInParams,
} from "../validators/asistencia.validator";
import { runValidation } from "../middlewares/validator.middleware";

const router = express.Router();

router.post("/", createAsistenciaValidator, runValidation, createAsistencia);
router.get("/", getAllAsistencias);
router.get("/:id", asistenciaInParams, runValidation, getAsistenciaById);
router.put("/:id", asistenciaInParams, runValidation, updateAsistenciaById);
router.delete("/:id", asistenciaInParams, runValidation, deleteAsistenciaById);
router.get("/seccionFecha", runValidation, getAsistenciasBySeccionAndFecha);

export default router;

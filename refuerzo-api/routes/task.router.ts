import express from "express";
import {
  createTarea,
  getAllTareas,
  getTareaById,
  updateTareaById,
  deleteTareaById,
  getTareasBySeccion,
} from "../controllers/task.controller";

import {
    createTareaValidator,
    tareaInParams,
} from "../validators/task.validator";

import { runValidation } from "../middlewares/validator.middleware";

const router = express.Router();

router.post("/", createTareaValidator, runValidation, createTarea);
router.get("/", getAllTareas);
router.get("/:id", tareaInParams, runValidation, getTareaById);
router.put("/:id", tareaInParams, runValidation, updateTareaById);
router.delete("/:id", tareaInParams, runValidation, deleteTareaById);
router.get("/seccion/:seccionId", runValidation, getTareasBySeccion);

export default router;

import express from "express";
import {
  createNotaTarea,
  getAllNotasTarea,
  getNotaTareaById,
  updateNotaTareaById,
  deleteNotaTareaById,
  getNotasByTarea,
} from "../controllers/noteTask.controller";

import {
  createNotaTareaValidator,
  notaTareaInParams,
} from "../validators/noteTask.validator";
import { runValidation } from "../middlewares/validator.middleware";

const router = express.Router();

router.post("/", createNotaTareaValidator, runValidation, createNotaTarea);
router.get("/", getAllNotasTarea);
router.get("/:id", notaTareaInParams, runValidation, getNotaTareaById);
router.put("/:id", notaTareaInParams, runValidation, updateNotaTareaById);
router.delete("/:id", notaTareaInParams, runValidation, deleteNotaTareaById);
router.get("/tarea/:tareaId", runValidation, getNotasByTarea);

export default router;

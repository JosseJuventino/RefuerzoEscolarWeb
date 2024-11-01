import express from "express";
import {
  createPostulante,
  getAllPostulantes,
  getPostulanteById,
  updatePostulanteById,
  deletePostulanteById,
  getPostulanteByEmail,
} from "../controllers/postulante.controller";

import {
  createPostulanteValidator,
  postulanteInParams,
} from "../validators/postulante.validator";
import { runValidation } from "../middlewares/validator.middleware";

const router = express.Router();

router.post("/", createPostulanteValidator, runValidation, createPostulante);
router.get("/", getAllPostulantes);
router.get("/:id", postulanteInParams, runValidation, getPostulanteById);
router.put("/:id", postulanteInParams, runValidation, updatePostulanteById);
router.delete("/:id", postulanteInParams, runValidation, deletePostulanteById);
router.get("/email/:email", runValidation, getPostulanteByEmail);

export default router;

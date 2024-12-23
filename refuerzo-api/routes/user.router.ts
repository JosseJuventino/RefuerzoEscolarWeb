// src/routes/usuario.router.ts
import express from "express";
import {
  createUsuario,
  getAllUsuarios,
  getUsuarioById,
  updateUsuarioById,
  deleteUsuarioById,
  getUsuarioByEmail,
} from "../controllers/user.controller";

import {
  createUsuarioValidator,
  usuarioInParams,
} from "../validators/user.validator";
import { runValidation } from "../middlewares/validator.middleware";

const router = express.Router();

router.post("/", createUsuarioValidator, runValidation, createUsuario);
router.get("/", getAllUsuarios);
router.get("/:id", usuarioInParams, runValidation, getUsuarioById);
router.put("/:id", usuarioInParams, runValidation, updateUsuarioById);
router.delete("/:id", usuarioInParams, runValidation, deleteUsuarioById);
router.get("/email/:email", runValidation, getUsuarioByEmail);

export default router;

// src/routes/index.ts
import express from "express";

const router = express.Router();

// Importación de los routers de cada recurso
import usuarioRouter from "./user.router";
import seccionRouter from "./section.router";
import tareaRouter from "./task.router";
import notaRouter from "./noteTask.model";
import asistenciaRouter from "./asistencia.router";
import postulanteRouter from "./postulante.router";
import roleRouter from "./roles.router";

// Definición de rutas
router.use("/usuarios", usuarioRouter);
router.use("/secciones", seccionRouter);
router.use("/tareas", tareaRouter);
router.use("/notas", notaRouter);
router.use("/asistencias", asistenciaRouter);
router.use("/postulantes", postulanteRouter);
router.use("/roles", roleRouter);

export default router;

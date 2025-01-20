"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Importación de los routers de cada recurso
const user_router_1 = __importDefault(require("./user.router"));
const section_router_1 = __importDefault(require("./section.router"));
const task_router_1 = __importDefault(require("./task.router"));
const noteTask_model_1 = __importDefault(require("./noteTask.model"));
const asistencia_router_1 = __importDefault(require("./asistencia.router"));
const postulante_router_1 = __importDefault(require("./postulante.router"));
const roles_router_1 = __importDefault(require("./roles.router"));
// Definición de rutas
router.use("/usuarios", user_router_1.default);
router.use("/secciones", section_router_1.default);
router.use("/tareas", task_router_1.default);
router.use("/notas", noteTask_model_1.default);
router.use("/asistencias", asistencia_router_1.default);
router.use("/postulantes", postulante_router_1.default);
router.use("/roles", roles_router_1.default);
exports.default = router;

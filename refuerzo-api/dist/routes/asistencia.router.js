"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asistencia_controller_1 = require("../controllers/asistencia.controller");
const asistencia_validator_1 = require("../validators/asistencia.validator");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = express_1.default.Router();
router.post("/", asistencia_validator_1.createAsistenciaValidator, validator_middleware_1.runValidation, asistencia_controller_1.createAsistencia);
router.get("/", asistencia_controller_1.getAllAsistencias);
router.get("/:id", asistencia_validator_1.asistenciaInParams, validator_middleware_1.runValidation, asistencia_controller_1.getAsistenciaById);
router.put("/:id", asistencia_validator_1.asistenciaInParams, validator_middleware_1.runValidation, asistencia_controller_1.updateAsistenciaById);
router.delete("/:id", asistencia_validator_1.asistenciaInParams, validator_middleware_1.runValidation, asistencia_controller_1.deleteAsistenciaById);
router.get("/seccionFecha", validator_middleware_1.runValidation, asistencia_controller_1.getAsistenciasBySeccionAndFecha);
exports.default = router;

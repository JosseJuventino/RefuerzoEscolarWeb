"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/seccion.router.ts
const express_1 = __importDefault(require("express"));
const section_controller_1 = require("../controllers/section.controller");
const section_validator_1 = require("../validators/section.validator");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = express_1.default.Router();
router.post("/", section_validator_1.createSeccionValidator, validator_middleware_1.runValidation, section_controller_1.createSeccion);
router.get("/", section_controller_1.getAllSecciones);
router.get("/:id", section_validator_1.seccionInParams, validator_middleware_1.runValidation, section_controller_1.getSeccionById);
router.put("/:id", section_validator_1.seccionInParams, validator_middleware_1.runValidation, section_controller_1.updateSeccionById);
router.delete("/:id", section_validator_1.seccionInParams, validator_middleware_1.runValidation, section_controller_1.deleteSeccionById);
router.get("/year/:año", validator_middleware_1.runValidation, section_controller_1.getSeccionesByYear);
exports.default = router;

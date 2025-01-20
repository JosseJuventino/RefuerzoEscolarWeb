"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_controller_1 = require("../controllers/task.controller");
const task_validator_1 = require("../validators/task.validator");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = express_1.default.Router();
router.post("/", task_validator_1.createTareaValidator, validator_middleware_1.runValidation, task_controller_1.createTarea);
router.get("/", task_controller_1.getAllTareas);
router.get("/:id", task_validator_1.tareaInParams, validator_middleware_1.runValidation, task_controller_1.getTareaById);
router.put("/:id", task_validator_1.tareaInParams, validator_middleware_1.runValidation, task_controller_1.updateTareaById);
router.delete("/:id", task_validator_1.tareaInParams, validator_middleware_1.runValidation, task_controller_1.deleteTareaById);
router.get("/seccion/:seccionId", validator_middleware_1.runValidation, task_controller_1.getTareasBySeccion);
exports.default = router;

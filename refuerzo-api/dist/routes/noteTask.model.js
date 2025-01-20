"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const noteTask_controller_1 = require("../controllers/noteTask.controller");
const noteTask_validator_1 = require("../validators/noteTask.validator");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = express_1.default.Router();
router.post("/", noteTask_validator_1.createNotaTareaValidator, validator_middleware_1.runValidation, noteTask_controller_1.createNotaTarea);
router.get("/", noteTask_controller_1.getAllNotasTarea);
router.get("/:id", noteTask_validator_1.notaTareaInParams, validator_middleware_1.runValidation, noteTask_controller_1.getNotaTareaById);
router.put("/:id", noteTask_validator_1.notaTareaInParams, validator_middleware_1.runValidation, noteTask_controller_1.updateNotaTareaById);
router.delete("/:id", noteTask_validator_1.notaTareaInParams, validator_middleware_1.runValidation, noteTask_controller_1.deleteNotaTareaById);
router.get("/tarea/:tareaId", validator_middleware_1.runValidation, noteTask_controller_1.getNotasByTarea);
exports.default = router;

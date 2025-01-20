"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/usuario.router.ts
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const user_validator_1 = require("../validators/user.validator");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = express_1.default.Router();
router.post("/", user_validator_1.createUsuarioValidator, validator_middleware_1.runValidation, user_controller_1.createUsuario);
router.get("/", user_controller_1.getAllUsuarios);
router.get("/:id", user_validator_1.usuarioInParams, validator_middleware_1.runValidation, user_controller_1.getUsuarioById);
router.put("/:id", user_validator_1.usuarioInParams, validator_middleware_1.runValidation, user_controller_1.updateUsuarioById);
router.delete("/:id", user_validator_1.usuarioInParams, validator_middleware_1.runValidation, user_controller_1.deleteUsuarioById);
router.get("/email/:email", validator_middleware_1.runValidation, user_controller_1.getUsuarioByEmail);
exports.default = router;

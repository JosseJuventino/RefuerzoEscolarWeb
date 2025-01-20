"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postulante_controller_1 = require("../controllers/postulante.controller");
const postulante_validator_1 = require("../validators/postulante.validator");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = express_1.default.Router();
router.post("/", postulante_validator_1.createPostulanteValidator, validator_middleware_1.runValidation, postulante_controller_1.createPostulante);
router.get("/", postulante_controller_1.getAllPostulantes);
router.get("/:id", postulante_validator_1.postulanteInParams, validator_middleware_1.runValidation, postulante_controller_1.getPostulanteById);
router.put("/:id", postulante_validator_1.postulanteInParams, validator_middleware_1.runValidation, postulante_controller_1.updatePostulanteById);
router.delete("/:id", postulante_validator_1.postulanteInParams, validator_middleware_1.runValidation, postulante_controller_1.deletePostulanteById);
router.get("/email/:email", validator_middleware_1.runValidation, postulante_controller_1.getPostulanteByEmail);
exports.default = router;

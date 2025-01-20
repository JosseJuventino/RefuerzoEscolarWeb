"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rol_controller_1 = require("../controllers/rol.controller");
const rol_validator_1 = require("../validators/rol.validator");
const validator_middleware_1 = require("../middlewares/validator.middleware");
const router = express_1.default.Router();
router.post('/', rol_validator_1.createRolValidator, validator_middleware_1.runValidation, rol_controller_1.createRol);
router.get('/', rol_controller_1.getAllRoles);
router.get('/:id', rol_validator_1.rolInParams, validator_middleware_1.runValidation, rol_controller_1.getRolById);
router.put('/:id', rol_validator_1.rolInParams, validator_middleware_1.runValidation, rol_controller_1.updateRolById);
router.delete('/:id', rol_validator_1.rolInParams, validator_middleware_1.runValidation, rol_controller_1.deleteRolById);
router.get('/nombre/:nombre', validator_middleware_1.runValidation, rol_controller_1.getRolByName);
exports.default = router;

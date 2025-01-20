"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRolById = exports.updateRolById = exports.getAllRoles = exports.getRolByName = exports.getRolById = exports.createRol = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const rol_model_1 = __importDefault(require("../models/rol.model"));
// Crear un nuevo rol
const createRol = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre } = req.body;
        const existingRol = yield rol_model_1.default.findOne({ nombre });
        if (existingRol) {
            res.status(400).json({ error: "Ya existe un rol con este nombre." });
            return;
        }
        const newRol = new rol_model_1.default({ nombre });
        const createdRol = yield newRol.save();
        res.status(201).json(createdRol);
    }
    catch (error) {
        next(error);
    }
});
exports.createRol = createRol;
// Obtener un rol por ID
const getRolById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const rol = yield rol_model_1.default.findById(id);
        if (!rol) {
            next((0, http_errors_1.default)(404, "Rol no encontrado"));
            return;
        }
        res.status(200).json({ data: rol });
    }
    catch (err) {
        next(err);
    }
});
exports.getRolById = getRolById;
// Obtener un rol por nombre
const getRolByName = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre } = req.params;
        const rolData = yield rol_model_1.default.findOne({ nombre });
        if (!rolData) {
            next((0, http_errors_1.default)(404, "Rol no encontrado"));
            return;
        }
        res.status(200).json({ data: rolData });
    }
    catch (err) {
        next(err);
    }
});
exports.getRolByName = getRolByName;
// Obtener todos los roles
const getAllRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield rol_model_1.default.find();
        if (!roles) {
            next((0, http_errors_1.default)(404, "Roles no encontrados"));
            return;
        }
        res.status(200).json({ data: roles });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllRoles = getAllRoles;
// Actualizar un rol por ID
const updateRolById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        const updatedRol = yield rol_model_1.default.findByIdAndUpdate(id, { nombre }, { new: true });
        if (!updatedRol) {
            next((0, http_errors_1.default)(404, "Rol no encontrado"));
            return;
        }
        res.status(200).json({ data: updatedRol });
    }
    catch (err) {
        next(err);
    }
});
exports.updateRolById = updateRolById;
// Eliminar un rol por ID
const deleteRolById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedRol = yield rol_model_1.default.findByIdAndDelete(id);
        if (!deletedRol) {
            next((0, http_errors_1.default)(404, "Rol no encontrado"));
            return;
        }
        res.status(200).json({ data: deletedRol });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteRolById = deleteRolById;

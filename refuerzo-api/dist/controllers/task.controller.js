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
exports.getTareasBySeccion = exports.deleteTareaById = exports.updateTareaById = exports.getAllTareas = exports.getTareaById = exports.createTarea = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const task_model_1 = __importDefault(require("../models/task.model"));
// Crear una nueva tarea
const createTarea = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seccion, descripcion, fechaAsignacion, fechaEntrega } = req.body;
        const newTarea = new task_model_1.default({
            seccion,
            descripcion,
            fechaAsignacion,
            fechaEntrega,
        });
        const createdTarea = yield newTarea.save();
        res.status(201).json(createdTarea);
    }
    catch (error) {
        next(error);
    }
});
exports.createTarea = createTarea;
const getTareaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const tarea = yield task_model_1.default.findById(id).populate("seccion");
        if (!tarea)
            throw (0, http_errors_1.default)(404, "Tarea no encontrada");
        res.status(200).json({ data: tarea });
    }
    catch (err) {
        next(err);
    }
});
exports.getTareaById = getTareaById;
const getAllTareas = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tareas = yield task_model_1.default.find().populate("seccion");
        if (!tareas)
            throw (0, http_errors_1.default)(404, "Tareas no encontradas");
        res.status(200).json({ data: tareas });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllTareas = getAllTareas;
const updateTareaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { seccion, descripcion, fechaAsignacion, fechaEntrega } = req.body;
        const updatedTarea = yield task_model_1.default.findByIdAndUpdate(id, { seccion, descripcion, fechaAsignacion, fechaEntrega }, { new: true }).populate("seccion");
        if (!updatedTarea) {
            throw (0, http_errors_1.default)(404, "Tarea no encontrada");
        }
        res.status(200).json({ data: updatedTarea });
    }
    catch (err) {
        next(err);
    }
});
exports.updateTareaById = updateTareaById;
const deleteTareaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedTarea = yield task_model_1.default.findByIdAndDelete(id);
        if (!deletedTarea)
            throw (0, http_errors_1.default)(404, "Tarea no encontrada");
        res.status(200).json({ data: deletedTarea });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteTareaById = deleteTareaById;
const getTareasBySeccion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seccionId } = req.params;
        const tareas = yield task_model_1.default.find({ seccion: seccionId }).populate("seccion");
        if (!tareas.length)
            throw (0, http_errors_1.default)(404, "No se encontraron tareas para esta sección");
        res.status(200).json({ data: tareas });
    }
    catch (err) {
        next(err);
    }
});
exports.getTareasBySeccion = getTareasBySeccion;

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
exports.getNotasByTarea = exports.deleteNotaTareaById = exports.updateNotaTareaById = exports.getAllNotasTarea = exports.getNotaTareaById = exports.createNotaTarea = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const noteTask_model_1 = __importDefault(require("../models/noteTask.model"));
// Crear una nueva nota de tarea
const createNotaTarea = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tarea, estudiante, nota, comentarios } = req.body;
        const newNotaTarea = new noteTask_model_1.default({
            tarea,
            estudiante,
            nota,
            comentarios,
        });
        const createdNotaTarea = yield newNotaTarea.save();
        res.status(201).json(createdNotaTarea);
    }
    catch (error) {
        next(error);
    }
});
exports.createNotaTarea = createNotaTarea;
const getNotaTareaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const notaTarea = yield noteTask_model_1.default.findById(id).populate("tarea estudiante");
        if (!notaTarea)
            throw (0, http_errors_1.default)(404, "Nota de tarea no encontrada");
        res.status(200).json({ data: notaTarea });
    }
    catch (err) {
        next(err);
    }
});
exports.getNotaTareaById = getNotaTareaById;
const getAllNotasTarea = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notasTarea = yield noteTask_model_1.default.find().populate("tarea estudiante");
        if (!notasTarea)
            throw (0, http_errors_1.default)(404, "Notas de tarea no encontradas");
        res.status(200).json({ data: notasTarea });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllNotasTarea = getAllNotasTarea;
const updateNotaTareaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { tarea, estudiante, nota, comentarios } = req.body;
        const updatedNotaTarea = yield noteTask_model_1.default.findByIdAndUpdate(id, { tarea, estudiante, nota, comentarios }, { new: true }).populate("tarea estudiante");
        if (!updatedNotaTarea) {
            throw (0, http_errors_1.default)(404, "Nota de tarea no encontrada");
        }
        res.status(200).json({ data: updatedNotaTarea });
    }
    catch (err) {
        next(err);
    }
});
exports.updateNotaTareaById = updateNotaTareaById;
const deleteNotaTareaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedNotaTarea = yield noteTask_model_1.default.findByIdAndDelete(id);
        if (!deletedNotaTarea)
            throw (0, http_errors_1.default)(404, "Nota de tarea no encontrada");
        res.status(200).json({ data: deletedNotaTarea });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteNotaTareaById = deleteNotaTareaById;
const getNotasByTarea = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tareaId } = req.params;
        const notasTarea = yield noteTask_model_1.default.find({ tarea: tareaId }).populate("tarea estudiante");
        if (!notasTarea.length)
            throw (0, http_errors_1.default)(404, "No se encontraron notas para esta tarea");
        res.status(200).json({ data: notasTarea });
    }
    catch (err) {
        next(err);
    }
});
exports.getNotasByTarea = getNotasByTarea;

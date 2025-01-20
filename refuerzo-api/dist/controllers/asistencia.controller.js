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
exports.deleteAsistenciaById = exports.updateAsistenciaById = exports.getAsistenciasBySeccionAndFecha = exports.getAllAsistencias = exports.getAsistenciaById = exports.createAsistencia = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const asistencia_model_1 = __importDefault(require("../models/asistencia.model"));
const createAsistencia = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seccion, estudiante, fecha, horaAsistencia, presente } = req.body;
        const newAsistencia = new asistencia_model_1.default({
            seccion,
            estudiante,
            fecha,
            horaAsistencia,
            presente,
        });
        const createdAsistencia = yield newAsistencia.save();
        res.status(201).json(createdAsistencia);
    }
    catch (error) {
        next(error);
    }
});
exports.createAsistencia = createAsistencia;
const getAsistenciaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const asistencia = yield asistencia_model_1.default.findById(id).populate("seccion estudiante");
        if (!asistencia)
            throw (0, http_errors_1.default)(404, "Asistencia no encontrada");
        res.status(200).json({ data: asistencia });
    }
    catch (err) {
        next(err);
    }
});
exports.getAsistenciaById = getAsistenciaById;
const getAllAsistencias = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const asistencias = yield asistencia_model_1.default.find().populate("seccion estudiante");
        if (!asistencias)
            throw (0, http_errors_1.default)(404, "Registros de asistencia no encontrados");
        res.status(200).json({ data: asistencias });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllAsistencias = getAllAsistencias;
const getAsistenciasBySeccionAndFecha = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seccionId, fecha } = req.query;
        const asistencias = yield asistencia_model_1.default.find({
            seccion: seccionId,
            fecha,
        }).populate("seccion estudiante");
        if (!asistencias.length)
            throw (0, http_errors_1.default)(404, "No se encontraron registros de asistencia para esta sección y fecha");
        res.status(200).json({ data: asistencias });
    }
    catch (err) {
        next(err);
    }
});
exports.getAsistenciasBySeccionAndFecha = getAsistenciasBySeccionAndFecha;
const updateAsistenciaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { seccion, estudiante, fecha, horaAsistencia, presente } = req.body;
        const updatedAsistencia = yield asistencia_model_1.default.findByIdAndUpdate(id, { seccion, estudiante, fecha, horaAsistencia, presente }, { new: true });
        if (!updatedAsistencia) {
            throw (0, http_errors_1.default)(404, "Asistencia no encontrada");
        }
        res.status(200).json({ data: updatedAsistencia });
    }
    catch (err) {
        next(err);
    }
});
exports.updateAsistenciaById = updateAsistenciaById;
const deleteAsistenciaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedAsistencia = yield asistencia_model_1.default.findByIdAndDelete(id);
        if (!deletedAsistencia)
            throw (0, http_errors_1.default)(404, "Asistencia no encontrada");
        res.status(200).json({ data: deletedAsistencia });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteAsistenciaById = deleteAsistenciaById;

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
exports.getSeccionesByYear = exports.deleteSeccionById = exports.updateSeccionById = exports.getAllSecciones = exports.getSeccionById = exports.createSeccion = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const section_model_1 = __importDefault(require("../models/section.model"));
// Crear una nueva sección
const createSeccion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, año, instructor, estado, estudiantes } = req.body;
        const newSeccion = new section_model_1.default({
            nombre,
            año,
            instructor,
            estado,
            estudiantes,
        });
        const createdSeccion = yield newSeccion.save();
        res.status(201).json(createdSeccion);
    }
    catch (error) {
        next(error);
    }
});
exports.createSeccion = createSeccion;
const getSeccionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const seccion = yield section_model_1.default.findById(id).populate("instructor estudiantes");
        if (!seccion)
            throw (0, http_errors_1.default)(404, "Sección no encontrada");
        res.status(200).json({ data: seccion });
    }
    catch (err) {
        next(err);
    }
});
exports.getSeccionById = getSeccionById;
const getAllSecciones = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secciones = yield section_model_1.default.find().populate("instructor estudiantes");
        if (!secciones)
            throw (0, http_errors_1.default)(404, "Secciones no encontradas");
        res.status(200).json({ data: secciones });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllSecciones = getAllSecciones;
const updateSeccionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nombre, año, instructor, estado, estudiantes } = req.body;
        const updatedSeccion = yield section_model_1.default.findByIdAndUpdate(id, { nombre, año, instructor, estado, estudiantes }, { new: true }).populate("instructor estudiantes");
        if (!updatedSeccion) {
            throw (0, http_errors_1.default)(404, "Sección no encontrada");
        }
        res.status(200).json({ data: updatedSeccion });
    }
    catch (err) {
        next(err);
    }
});
exports.updateSeccionById = updateSeccionById;
const deleteSeccionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedSeccion = yield section_model_1.default.findByIdAndDelete(id);
        if (!deletedSeccion)
            throw (0, http_errors_1.default)(404, "Sección no encontrada");
        res.status(200).json({ data: deletedSeccion });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteSeccionById = deleteSeccionById;
const getSeccionesByYear = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { año } = req.query;
        const secciones = yield section_model_1.default.find({ año }).populate("instructor estudiantes");
        if (!secciones.length)
            throw (0, http_errors_1.default)(404, "No se encontraron secciones para este año");
        res.status(200).json({ data: secciones });
    }
    catch (err) {
        next(err);
    }
});
exports.getSeccionesByYear = getSeccionesByYear;

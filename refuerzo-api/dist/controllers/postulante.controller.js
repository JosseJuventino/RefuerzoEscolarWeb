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
exports.deletePostulanteById = exports.updatePostulanteById = exports.getAllPostulantes = exports.getPostulanteByEmail = exports.getPostulanteById = exports.createPostulante = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const postulantes_model_1 = __importDefault(require("../models/postulantes.model"));
const kItemsPerPage = 10;
const createPostulante = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, email, año, estado, fechaEnvio } = req.body;
        // Comprobar si ya existe un postulante con el mismo correo electrónico
        const existingPostulante = yield postulantes_model_1.default.findOne({ email });
        if (existingPostulante) {
            res.status(400).json({
                error: "Ya existe un postulante con este correo electrónico.",
            });
            return;
        }
        const newPostulante = new postulantes_model_1.default({
            nombre,
            email,
            año,
            estado,
            fechaEnvio,
        });
        const createdPostulante = yield newPostulante.save();
        res.status(201).json(createdPostulante);
    }
    catch (error) {
        next(error);
    }
});
exports.createPostulante = createPostulante;
// Obtener un postulante por ID
const getPostulanteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const postulante = yield postulantes_model_1.default.findById(id);
        if (!postulante) {
            next((0, http_errors_1.default)(404, "Postulante no encontrado"));
            return;
        }
        res.status(200).json({ data: postulante });
    }
    catch (err) {
        next(err);
    }
});
exports.getPostulanteById = getPostulanteById;
// Obtener un postulante por correo electrónico
const getPostulanteByEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const postulanteData = yield postulantes_model_1.default.findOne({ email });
        if (!postulanteData) {
            next((0, http_errors_1.default)(404, "Postulante no encontrado"));
            return;
        }
        res.status(200).json({ data: postulanteData });
    }
    catch (err) {
        next(err);
    }
});
exports.getPostulanteByEmail = getPostulanteByEmail;
const getAllPostulantes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || kItemsPerPage;
        const timestamp = new Date();
        const totalDocuments = yield postulantes_model_1.default.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);
        if (page > totalPages && totalPages > 0) {
            next((0, http_errors_1.default)(404, "Página fuera de rango"));
            return;
        }
        const skip = (page - 1) * limit;
        const postulantes = yield postulantes_model_1.default.find().skip(skip).limit(limit);
        res.status(200).json({
            data: postulantes,
            totalDocuments,
            timestamp,
            page,
            limit,
            totalPages,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllPostulantes = getAllPostulantes;
// Actualizar un postulante por ID
const updatePostulanteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nombre, email, año, estado, fechaEnvio } = req.body;
        const updatedPostulante = yield postulantes_model_1.default.findByIdAndUpdate(id, { nombre, email, año, estado, fechaEnvio }, { new: true });
        if (!updatedPostulante) {
            next((0, http_errors_1.default)(404, "Postulante no encontrado"));
            return;
        }
        res.status(200).json({ data: updatedPostulante });
    }
    catch (err) {
        next(err);
    }
});
exports.updatePostulanteById = updatePostulanteById;
// Eliminar un postulante por ID
const deletePostulanteById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedPostulante = yield postulantes_model_1.default.findByIdAndDelete(id);
        if (!deletedPostulante) {
            next((0, http_errors_1.default)(404, "Postulante no encontrado"));
            return;
        }
        res.status(200).json({ data: deletedPostulante });
    }
    catch (err) {
        next(err);
    }
});
exports.deletePostulanteById = deletePostulanteById;

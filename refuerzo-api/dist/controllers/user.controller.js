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
exports.deleteUsuarioById = exports.updateUsuarioById = exports.getAllUsuarios = exports.getUsuarioByEmail = exports.getUsuarioById = exports.createUsuario = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Crear un nuevo usuario
const createUsuario = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, apellido, email, password, rol } = req.body;
        // Comprobar si ya existe un usuario con el mismo correo electrónico
        const existingUsuario = yield user_model_1.default.findOne({ email });
        if (existingUsuario) {
            res
                .status(400)
                .json({ error: "Ya existe un usuario con este correo electrónico." });
            return;
        }
        // Crear un nuevo objeto Usuario
        const newUsuario = new user_model_1.default({
            nombre,
            apellido,
            email,
            password,
            rol,
        });
        const createdUsuario = yield newUsuario.save();
        res.status(201).json(createdUsuario);
    }
    catch (error) {
        next(error);
    }
});
exports.createUsuario = createUsuario;
// Obtener un usuario por ID
const getUsuarioById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const usuario = yield user_model_1.default.findById(id).populate("rol");
        if (!usuario) {
            next((0, http_errors_1.default)(404, "Usuario no encontrado"));
            return;
        }
        res.status(200).json({ data: usuario });
    }
    catch (err) {
        next(err);
    }
});
exports.getUsuarioById = getUsuarioById;
// Obtener un usuario por correo electrónico
const getUsuarioByEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        const usuarioData = yield user_model_1.default.findOne({ email }).populate("rol");
        if (!usuarioData) {
            next((0, http_errors_1.default)(404, "Usuario no encontrado"));
            return;
        }
        res.status(200).json({ data: usuarioData });
    }
    catch (err) {
        next(err);
    }
});
exports.getUsuarioByEmail = getUsuarioByEmail;
// Obtener todos los usuarios
const getAllUsuarios = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield user_model_1.default.find().populate("rol");
        if (!usuarios) {
            next((0, http_errors_1.default)(404, "Usuarios no encontrados"));
            return;
        }
        res.status(200).json({ data: usuarios });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllUsuarios = getAllUsuarios;
// Actualizar un usuario por ID
const updateUsuarioById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, password, rol } = req.body;
        const updatedUsuario = yield user_model_1.default.findByIdAndUpdate(id, { nombre, apellido, email, password, rol }, { new: true });
        if (!updatedUsuario) {
            next((0, http_errors_1.default)(404, "Usuario no encontrado"));
            return;
        }
        res.status(200).json({ data: updatedUsuario });
    }
    catch (err) {
        next(err);
    }
});
exports.updateUsuarioById = updateUsuarioById;
// Eliminar un usuario por ID
const deleteUsuarioById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedUsuario = yield user_model_1.default.findByIdAndDelete(id);
        if (!deletedUsuario) {
            next((0, http_errors_1.default)(404, "Usuario no encontrado"));
            return;
        }
        res.status(200).json({ data: deletedUsuario });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteUsuarioById = deleteUsuarioById;

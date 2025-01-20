"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const debug_1 = __importDefault(require("debug"));
const debugLog = (0, debug_1.default)("marn-api:error");
// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
    debugLog(err);
    res.status(err.status || 500).json({ message: err.message });
};
exports.errorHandler = errorHandler;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envconfig = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/will-api",
    PORT: process.env.PORT || "3000",
};
exports.default = envconfig;

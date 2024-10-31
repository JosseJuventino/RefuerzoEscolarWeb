// src/controllers/usuario.controller.ts
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Usuario from "../models/user.model";

// Crear un nuevo usuario
export const createUsuario = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    // Comprobar si ya existe un usuario con el mismo correo electrónico
    const existingUsuario = await Usuario.findOne({ email });
    if (existingUsuario) {
      return res
        .status(400)
        .json({ error: "Ya existe un usuario con este correo electrónico." });
    }

    // Crear un nuevo objeto Usuario
    const newUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password,
      rol,
    });

    const createdUsuario = await newUsuario.save();

    res.status(201).json(createdUsuario);
  } catch (error) {
    next(error);
  }
};

export const getUsuarioById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).populate("rol");
    if (!usuario) throw httpError(404, "Usuario no encontrado");
    res.status(200).json({ data: usuario });
  } catch (err) {
    next(err);
  }
};

export const getUsuarioByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;
    const usuarioData = await Usuario.findOne({ email }).populate("rol");
    if (!usuarioData) throw httpError(404, "Usuario no encontrado");
    res.status(200).json({ data: usuarioData });
  } catch (err) {
    next(err);
  }
};

export const getAllUsuarios = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usuarios = await Usuario.find().populate("rol");
    if (!usuarios) throw httpError(404, "Usuarios no encontrados");
    res.status(200).json({ data: usuarios });
  } catch (err) {
    next(err);
  }
};

export const updateUsuarioById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol } = req.body;

    const updatedUsuario = await Usuario.findByIdAndUpdate(
      id,
      { nombre, apellido, email, password, rol },
      { new: true }
    );

    if (!updatedUsuario) {
      throw httpError(404, "Usuario no encontrado");
    }

    res.status(200).json({ data: updatedUsuario });
  } catch (err) {
    next(err);
  }
};

export const deleteUsuarioById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedUsuario = await Usuario.findByIdAndDelete(id);
    if (!deletedUsuario) throw httpError(404, "Usuario no encontrado");
    res.status(200).json({ data: deletedUsuario });
  } catch (err) {
    next(err);
  }
};

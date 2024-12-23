// src/controllers/rol.controller.ts
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Rol from "../models/rol.model";

// Crear un nuevo rol
export const createRol = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre } = req.body;

    const existingRol = await Rol.findOne({ nombre });
    if (existingRol) {
      res.status(400).json({ error: "Ya existe un rol con este nombre." });
      return;
    }

    const newRol = new Rol({ nombre });
    const createdRol = await newRol.save();

    res.status(201).json(createdRol);
  } catch (error) {
    next(error);
  }
};

// Obtener un rol por ID
export const getRolById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const rol = await Rol.findById(id);
    if (!rol) {
      next(httpError(404, "Rol no encontrado"));
      return;
    }
    res.status(200).json({ data: rol });
  } catch (err) {
    next(err);
  }
};

// Obtener un rol por nombre
export const getRolByName = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre } = req.params;
    const rolData = await Rol.findOne({ nombre });
    if (!rolData) {
      next(httpError(404, "Rol no encontrado"));
      return;
    }
    res.status(200).json({ data: rolData });
  } catch (err) {
    next(err);
  }
};

// Obtener todos los roles
export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roles = await Rol.find();
    if (!roles) {
      next(httpError(404, "Roles no encontrados"));
      return;
    }
    res.status(200).json({ data: roles });
  } catch (err) {
    next(err);
  }
};

// Actualizar un rol por ID
export const updateRolById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const updatedRol = await Rol.findByIdAndUpdate(
      id,
      { nombre },
      { new: true }
    );

    if (!updatedRol) {
      next(httpError(404, "Rol no encontrado"));
      return;
    }

    res.status(200).json({ data: updatedRol });
  } catch (err) {
    next(err);
  }
};

// Eliminar un rol por ID
export const deleteRolById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedRol = await Rol.findByIdAndDelete(id);
    if (!deletedRol) {
      next(httpError(404, "Rol no encontrado"));
      return;
    }
    res.status(200).json({ data: deletedRol });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Rol from "../models/rol.model";

// Crear un nuevo rol
export const createRol = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombre } = req.body;

    const existingRol = await Rol.findOne({ nombre });
    if (existingRol) {
      return res
        .status(400)
        .json({ error: "Ya existe un rol con este nombre." });
    }

    const newRol = new Rol({
      nombre,
    });

    const createdRol = await newRol.save();

    res.status(201).json(createdRol);
  } catch (error) {
    next(error);
  }
};


export const getRolById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findById(id);
    if (!rol) throw httpError(404, "Rol no encontrado");
    res.status(200).json({ data: rol });
  } catch (err) {
    next(err);
  }
};

export const getRolByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombre } = req.params;
    const rolData = await Rol.findOne({ nombre });
    if (!rolData) throw httpError(404, "Rol no encontrado");
    res.status(200).json({ data: rolData });
  } catch (err) {
    next(err);
  }
};

export const getAllRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await Rol.find();
    if (!roles) throw httpError(404, "Roles no encontrados");
    res.status(200).json({ data: roles });
  } catch (err) {
    next(err);
  }
};

export const updateRolById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const updatedRol = await Rol.findByIdAndUpdate(
      id,
      { nombre },
      { new: true }
    );

    if (!updatedRol) {
      throw httpError(404, "Rol no encontrado");
    }

    res.status(200).json({ data: updatedRol });
  } catch (err) {
    next(err);
  }
};

export const deleteRolById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedRol = await Rol.findByIdAndDelete(id);
    if (!deletedRol) throw httpError(404, "Rol no encontrado");
    res.status(200).json({ data: deletedRol });
  } catch (err) {
    next(err);
  }
};

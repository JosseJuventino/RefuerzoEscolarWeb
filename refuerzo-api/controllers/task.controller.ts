// src/controllers/tarea.controller.ts
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Tarea from "../models/task.model";

// Crear una nueva tarea
export const createTarea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { seccion, descripcion, fechaAsignacion, fechaEntrega } = req.body;

    const newTarea = new Tarea({
      seccion,
      descripcion,
      fechaAsignacion,
      fechaEntrega,
    });

    const createdTarea = await newTarea.save();

    res.status(201).json(createdTarea);
  } catch (error) {
    next(error);
  }
};

export const getTareaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const tarea = await Tarea.findById(id).populate("seccion");
    if (!tarea) throw httpError(404, "Tarea no encontrada");
    res.status(200).json({ data: tarea });
  } catch (err) {
    next(err);
  }
};

export const getAllTareas = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tareas = await Tarea.find().populate("seccion");
    if (!tareas) throw httpError(404, "Tareas no encontradas");
    res.status(200).json({ data: tareas });
  } catch (err) {
    next(err);
  }
};

export const updateTareaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { seccion, descripcion, fechaAsignacion, fechaEntrega } = req.body;

    const updatedTarea = await Tarea.findByIdAndUpdate(
      id,
      { seccion, descripcion, fechaAsignacion, fechaEntrega },
      { new: true }
    ).populate("seccion");

    if (!updatedTarea) {
      throw httpError(404, "Tarea no encontrada");
    }

    res.status(200).json({ data: updatedTarea });
  } catch (err) {
    next(err);
  }
};

export const deleteTareaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedTarea = await Tarea.findByIdAndDelete(id);
    if (!deletedTarea) throw httpError(404, "Tarea no encontrada");
    res.status(200).json({ data: deletedTarea });
  } catch (err) {
    next(err);
  }
};

export const getTareasBySeccion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { seccionId } = req.params;
    const tareas = await Tarea.find({ seccion: seccionId }).populate("seccion");
    if (!tareas.length)
      throw httpError(404, "No se encontraron tareas para esta sección");
    res.status(200).json({ data: tareas });
  } catch (err) {
    next(err);
  }
};

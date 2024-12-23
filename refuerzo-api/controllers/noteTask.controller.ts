// src/controllers/notaTarea.controller.ts
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import NotaTarea from "../models/noteTask.model";

// Crear una nueva nota de tarea
export const createNotaTarea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tarea, estudiante, nota, comentarios } = req.body;

    const newNotaTarea = new NotaTarea({
      tarea,
      estudiante,
      nota,
      comentarios,
    });

    const createdNotaTarea = await newNotaTarea.save();

    res.status(201).json(createdNotaTarea);
  } catch (error) {
    next(error);
  }
};

export const getNotaTareaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const notaTarea = await NotaTarea.findById(id).populate("tarea estudiante");
    if (!notaTarea) throw httpError(404, "Nota de tarea no encontrada");
    res.status(200).json({ data: notaTarea });
  } catch (err) {
    next(err);
  }
};

export const getAllNotasTarea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notasTarea = await NotaTarea.find().populate("tarea estudiante");
    if (!notasTarea) throw httpError(404, "Notas de tarea no encontradas");
    res.status(200).json({ data: notasTarea });
  } catch (err) {
    next(err);
  }
};

export const updateNotaTareaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { tarea, estudiante, nota, comentarios } = req.body;

    const updatedNotaTarea = await NotaTarea.findByIdAndUpdate(
      id,
      { tarea, estudiante, nota, comentarios },
      { new: true }
    ).populate("tarea estudiante");

    if (!updatedNotaTarea) {
      throw httpError(404, "Nota de tarea no encontrada");
    }

    res.status(200).json({ data: updatedNotaTarea });
  } catch (err) {
    next(err);
  }
};

export const deleteNotaTareaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedNotaTarea = await NotaTarea.findByIdAndDelete(id);
    if (!deletedNotaTarea) throw httpError(404, "Nota de tarea no encontrada");
    res.status(200).json({ data: deletedNotaTarea });
  } catch (err) {
    next(err);
  }
};

export const getNotasByTarea = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tareaId } = req.params;
    const notasTarea = await NotaTarea.find({ tarea: tareaId }).populate(
      "tarea estudiante"
    );
    if (!notasTarea.length)
      throw httpError(404, "No se encontraron notas para esta tarea");
    res.status(200).json({ data: notasTarea });
  } catch (err) {
    next(err);
  }
};

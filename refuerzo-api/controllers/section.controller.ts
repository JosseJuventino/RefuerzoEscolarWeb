// src/controllers/seccion.controller.ts
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Seccion from "../models/section.model";

// Crear una nueva sección
export const createSeccion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombre, año, instructor, estado, estudiantes } = req.body;

    const newSeccion = new Seccion({
      nombre,
      año,
      instructor,
      estado,
      estudiantes,
    });

    const createdSeccion = await newSeccion.save();

    res.status(201).json(createdSeccion);
  } catch (error) {
    next(error);
  }
};

export const getSeccionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const seccion = await Seccion.findById(id).populate(
      "instructor estudiantes"
    );
    if (!seccion) throw httpError(404, "Sección no encontrada");
    res.status(200).json({ data: seccion });
  } catch (err) {
    next(err);
  }
};

export const getAllSecciones = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const secciones = await Seccion.find().populate("instructor estudiantes");
    if (!secciones) throw httpError(404, "Secciones no encontradas");
    res.status(200).json({ data: secciones });
  } catch (err) {
    next(err);
  }
};

export const updateSeccionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nombre, año, instructor, estado, estudiantes } = req.body;

    const updatedSeccion = await Seccion.findByIdAndUpdate(
      id,
      { nombre, año, instructor, estado, estudiantes },
      { new: true }
    ).populate("instructor estudiantes");

    if (!updatedSeccion) {
      throw httpError(404, "Sección no encontrada");
    }

    res.status(200).json({ data: updatedSeccion });
  } catch (err) {
    next(err);
  }
};

export const deleteSeccionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedSeccion = await Seccion.findByIdAndDelete(id);
    if (!deletedSeccion) throw httpError(404, "Sección no encontrada");
    res.status(200).json({ data: deletedSeccion });
  } catch (err) {
    next(err);
  }
};

export const getSeccionesByYear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { año } = req.query;
    const secciones = await Seccion.find({ año }).populate(
      "instructor estudiantes"
    );
    if (!secciones.length)
      throw httpError(404, "No se encontraron secciones para este año");
    res.status(200).json({ data: secciones });
  } catch (err) {
    next(err);
  }
};

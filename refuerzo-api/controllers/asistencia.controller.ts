// src/controllers/asistencia.controller.ts
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Asistencia from "../models/asistencia.model";

export const createAsistencia = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { seccion, estudiante, fecha, horaAsistencia, presente } = req.body;

    const newAsistencia = new Asistencia({
      seccion,
      estudiante,
      fecha,
      horaAsistencia,
      presente,
    });

    const createdAsistencia = await newAsistencia.save();

    res.status(201).json(createdAsistencia);
  } catch (error) {
    next(error);
  }
};

export const getAsistenciaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const asistencia = await Asistencia.findById(id).populate(
      "seccion estudiante"
    );
    if (!asistencia) throw httpError(404, "Asistencia no encontrada");
    res.status(200).json({ data: asistencia });
  } catch (err) {
    next(err);
  }
};

export const getAllAsistencias = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const asistencias = await Asistencia.find().populate("seccion estudiante");
    if (!asistencias)
      throw httpError(404, "Registros de asistencia no encontrados");
    res.status(200).json({ data: asistencias });
  } catch (err) {
    next(err);
  }
};

export const getAsistenciasBySeccionAndFecha = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { seccionId, fecha } = req.query;

    const asistencias = await Asistencia.find({
      seccion: seccionId,
      fecha,
    }).populate("seccion estudiante");
    if (!asistencias.length)
      throw httpError(
        404,
        "No se encontraron registros de asistencia para esta sección y fecha"
      );

    res.status(200).json({ data: asistencias });
  } catch (err) {
    next(err);
  }
};

export const updateAsistenciaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { seccion, estudiante, fecha, horaAsistencia, presente } = req.body;

    const updatedAsistencia = await Asistencia.findByIdAndUpdate(
      id,
      { seccion, estudiante, fecha, horaAsistencia, presente },
      { new: true }
    );

    if (!updatedAsistencia) {
      throw httpError(404, "Asistencia no encontrada");
    }

    res.status(200).json({ data: updatedAsistencia });
  } catch (err) {
    next(err);
  }
};

export const deleteAsistenciaById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedAsistencia = await Asistencia.findByIdAndDelete(id);
    if (!deletedAsistencia) throw httpError(404, "Asistencia no encontrada");
    res.status(200).json({ data: deletedAsistencia });
  } catch (err) {
    next(err);
  }
};

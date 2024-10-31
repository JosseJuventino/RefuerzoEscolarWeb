// src/controllers/postulante.controller.ts
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Postulante from "../models/postulantes.model";

// Crear un nuevo postulante
export const createPostulante = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nombre, email, año, estado, fechaEnvio } = req.body;

    // Comprobar si ya existe un postulante con el mismo correo electrónico
    const existingPostulante = await Postulante.findOne({ email });
    if (existingPostulante) {
      return res
        .status(400)
        .json({
          error: "Ya existe un postulante con este correo electrónico.",
        });
    }

    // Crear un nuevo objeto Postulante
    const newPostulante = new Postulante({
      nombre,
      email,
      año,
      estado,
      fechaEnvio,
    });
      
    const createdPostulante = await newPostulante.save();

    res.status(201).json(createdPostulante);
  } catch (error) {
    next(error);
  }
};

export const getPostulanteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const postulante = await Postulante.findById(id);
    if (!postulante) throw httpError(404, "Postulante no encontrado");
    res.status(200).json({ data: postulante });
  } catch (err) {
    next(err);
  }
};

export const getPostulanteByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;
    const postulanteData = await Postulante.findOne({ email });
    if (!postulanteData) throw httpError(404, "Postulante no encontrado");
    res.status(200).json({ data: postulanteData });
  } catch (err) {
    next(err);
  }
};

export const getAllPostulantes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postulantes = await Postulante.find();
    if (!postulantes) throw httpError(404, "Postulantes no encontrados");
    res.status(200).json({ data: postulantes });
  } catch (err) {
    next(err);
  }
};

export const updatePostulanteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { nombre, email, año, estado, fechaEnvio } = req.body;

    const updatedPostulante = await Postulante.findByIdAndUpdate(
      id,
      { nombre, email, año, estado, fechaEnvio },
      { new: true }
    );

    if (!updatedPostulante) {
      throw httpError(404, "Postulante no encontrado");
    }

    res.status(200).json({ data: updatedPostulante });
  } catch (err) {
    next(err);
  }
};

export const deletePostulanteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedPostulante = await Postulante.findByIdAndDelete(id);
    if (!deletedPostulante) throw httpError(404, "Postulante no encontrado");
    res.status(200).json({ data: deletedPostulante });
  } catch (err) {
    next(err);
  }
};

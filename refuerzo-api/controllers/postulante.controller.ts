
import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import Postulante from "../models/postulantes.model";

const kItemsPerPage = 10;

export const createPostulante = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nombre, email, año, estado, fechaEnvio } = req.body;

    // Comprobar si ya existe un postulante con el mismo correo electrónico
    const existingPostulante = await Postulante.findOne({ email });
    if (existingPostulante) {
      res.status(400).json({
        error: "Ya existe un postulante con este correo electrónico.",
      });
      return;
    }

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

// Obtener un postulante por ID
export const getPostulanteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const postulante = await Postulante.findById(id);
    if (!postulante) {
      next(httpError(404, "Postulante no encontrado"));
      return;
    }
    res.status(200).json({ data: postulante });
  } catch (err) {
    next(err);
  }
};

// Obtener un postulante por correo electrónico
export const getPostulanteByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.params;
    const postulanteData = await Postulante.findOne({ email });
    if (!postulanteData) {
      next(httpError(404, "Postulante no encontrado"));
      return;
    }
    res.status(200).json({ data: postulanteData });
  } catch (err) {
    next(err);
  }
};

export const getAllPostulantes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1; 
    const limit = parseInt(req.query.limit as string) || kItemsPerPage;
    const timestamp = new Date(); 

    const totalDocuments = await Postulante.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit); 

    if (page > totalPages && totalPages > 0) {
      next(httpError(404, "Página fuera de rango"));
      return;
    }

    const skip = (page - 1) * limit; 

    const postulantes = await Postulante.find().skip(skip).limit(limit);

    res.status(200).json({
      data: postulantes,
      totalDocuments,
      timestamp,
      page,
      limit,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
};

// Actualizar un postulante por ID
export const updatePostulanteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, email, año, estado, fechaEnvio } = req.body;

    const updatedPostulante = await Postulante.findByIdAndUpdate(
      id,
      { nombre, email, año, estado, fechaEnvio },
      { new: true }
    );

    if (!updatedPostulante) {
      next(httpError(404, "Postulante no encontrado"));
      return;
    }

    res.status(200).json({ data: updatedPostulante });
  } catch (err) {
    next(err);
  }
};

// Eliminar un postulante por ID
export const deletePostulanteById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedPostulante = await Postulante.findByIdAndDelete(id);
    if (!deletedPostulante) {
      next(httpError(404, "Postulante no encontrado"));
      return;
    }
    res.status(200).json({ data: deletedPostulante });
  } catch (err) {
    next(err);
  }
};

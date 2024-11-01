import express from 'express';
import {
  createRol,
  getAllRoles,
  getRolById,
  updateRolById,
  deleteRolById,
  getRolByName,
} from '../controllers/rol.controller';

import { createRolValidator, rolInParams } from '../validators/rol.validator';
import { runValidation } from '../middlewares/validator.middleware';

const router = express.Router();

router.post('/', createRolValidator, runValidation, createRol);
router.get('/', getAllRoles);
router.get('/:id', rolInParams, runValidation, getRolById);
router.put('/:id', rolInParams, runValidation, updateRolById);
router.delete('/:id', rolInParams, runValidation, deleteRolById);
router.get('/nombre/:nombre', runValidation, getRolByName);

export default router;

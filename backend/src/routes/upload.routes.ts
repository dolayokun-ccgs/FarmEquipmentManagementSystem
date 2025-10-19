import { Router } from 'express';
import {
  uploadEquipmentImages,
  deleteEquipmentImage,
} from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/multer';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload equipment images (max 5 images)
router.post('/equipment', upload.array('images', 5), uploadEquipmentImages);

// Delete equipment image
router.delete('/equipment/:filename', deleteEquipmentImage);

export default router;

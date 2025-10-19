import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

/**
 * Upload equipment images
 * POST /api/upload/equipment
 */
export const uploadEquipmentImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'No files uploaded',
      });
      return;
    }

    const files = req.files as Express.Multer.File[];

    // Generate URLs for uploaded images
    const imageUrls = files.map(
      (file) => `/uploads/equipment/${file.filename}`
    );

    res.status(200).json({
      status: 'success',
      message: 'Images uploaded successfully',
      data: {
        images: imageUrls,
      },
    });
  } catch (error) {
    console.error('Upload equipment images error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload images',
    });
  }
};

/**
 * Delete equipment image
 * DELETE /api/upload/equipment/:filename
 */
export const deleteEquipmentImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    const { filename } = req.params;

    if (!filename) {
      res.status(400).json({
        status: 'error',
        message: 'Filename is required',
      });
      return;
    }

    // Security: Prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'equipment',
      sanitizedFilename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        status: 'error',
        message: 'File not found',
      });
      return;
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete equipment image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete image',
    });
  }
};

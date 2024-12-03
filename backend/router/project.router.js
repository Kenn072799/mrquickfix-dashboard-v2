import express from 'express';

import { AddProject, File_Storage, getProjects, removeProject, handleMulterError } from '../controllers/project.controller.js';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  storage: File_Storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    fieldSize: 50 * 1024 * 1024, // 50MB limit for the entire request
    files: 11 // Maximum number of files (10 project images + 1 thumbnail)
  }
});

const uploadFields = upload.fields([
  { name: 'projectThumbnail', maxCount: 1 },
  { name: 'projectImage', maxCount: 10 }
]);

router.use(handleMulterError);

router.post('/save', (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      handleMulterError(err, req, res, next);
    } else {
      AddProject(req, res, next);
    }
  });
});

router.get('/', getProjects);
router.delete('/remove/:id', removeProject);

export default router;
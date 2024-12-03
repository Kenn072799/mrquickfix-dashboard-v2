import express from 'express';

import { AddService, editService, editServicewImage, File_Storage, getServices, removeService } from '../controllers/services.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({storage:File_Storage})

router.post('/save', upload.single("serviceImage"),AddService);
router.get('/',getServices);
router.delete('/removeservice/:id',removeService);
router.patch('/update-text/:id', editService);
router.patch('/update-image/:id', upload.single("serviceImage"), editServicewImage);

export default router;
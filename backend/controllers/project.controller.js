import mongoose from "mongoose";
import Projects from "../models/project.model.js";
import multer from 'multer';
import ProjectIDCounter from "../models/projectIDCounter.model.js";
import { Upload_Multiple_File, upload_Single_Image } from "../utils/helpers.js";

export const File_Storage = multer.memoryStorage();

// @desc Create a new project
// @route POST /api/projects
export const AddProject = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate request
        if (!req.body || !req.files) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required project data or files" 
            });
        }

        const { body: projectData, files } = req;

        // Validate files
        if (!files.projectThumbnail || !files.projectThumbnail[0]) {
            return res.status(400).json({
                success: false,
                message: "Project thumbnail is required"
            });
        }

        const projectImages = files.projectImage || [];
        if (!projectImages.length) {
            return res.status(400).json({
                success: false,
                message: "At least one project image is required"
            });
        }

        // Get counter first to ensure database connection
        const counter = await ProjectIDCounter.findOneAndUpdate(
            {},
            { $inc: { lastProjectUploadID: 1 } },
            { upsert: true, new: true, session }
        );

        // Upload thumbnail
        let thumbnailResult;
        try {
            thumbnailResult = await upload_Single_Image(files.projectThumbnail[0].buffer);
        } catch (error) {
            throw new Error(`Failed to upload thumbnail: ${error.message}`);
        }

        // Upload project images
        let imageUrls;
        try {
            imageUrls = await Upload_Multiple_File(projectImages);
        } catch (error) {
            throw new Error(`Failed to upload project images: ${error.message}`);
        }

        const newProject = new Projects({
            projectID: String(counter.lastProjectUploadID),
            projectName: projectData.projectName,
            projectServices: projectData.projectServices,
            projectImagesUrl: imageUrls,
            projectThumbnail: thumbnailResult.url,
            createdAt: new Date()
        });

        await newProject.save({ session });
        await session.commitTransaction();

        res.status(201).json({ 
            success: true, 
            data: newProject 
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error in AddProject:", error);
        
        // Send more specific error messages to client
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to save project",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        session.endSession();
    }
};

// @desc Get all projects
// @route GET /api/projects
export const getProjects = async (req, res) => {
    try {
        const projects = await Projects.find({})
            .select('-__v')
            .lean()
            .exec();

        res.status(200).json({ 
            success: true, 
            data: projects 
        });
    } catch (error) {
        console.error("Error in getProjects:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch projects",
            error: error.message 
        });
    }
};

// @desc Remove a project
// @route DELETE /api/projects/:id
export const removeProject = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid project ID format' 
            });
        }

        const deletedProject = await Projects.findByIdAndDelete(id).exec();
        
        if (!deletedProject) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: deletedProject 
        });
    } catch (error) {
        console.error("Error in removeProject:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete project",
            error: error.message 
        });
    }
};

// @desc Handle Multer errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB per file.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum is 10 images.'
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({
          success: false,
          message: 'Field name invalid'
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          success: false,
          message: 'Field value too long'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many fields'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error uploading file'
        });
    }
  }
  next(err);
};

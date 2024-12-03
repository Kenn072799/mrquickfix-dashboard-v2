import mongoose from "mongoose";
import Services from "../models/services.model.js";
import multer from "multer";
import ProjectIDCounter from "../models/projectIDCounter.model.js";
import { upload_Single_Image } from "../utils/helpers.js";

// @desc Add new service
// @route POST /api/services
export const File_Storage = multer.memoryStorage();
export const AddService = async (req,res)=>{
    const service = req.body;
    const buffer = req.file.buffer;
    try{
        let checkServiceName = await Services.findOne({serviceName: service.serviceName});
        if(checkServiceName) return res.status(400).json({message:
            'This service name is already existed. Please try another name.'
        })

        let counter = await ProjectIDCounter.findOne();
        if(!counter) {
            counter = new ProjectIDCounter({lastServiceID:0});
            await counter.save();
        }

        const newServiceID = String(counter.lastServiceID + 1);
        await ProjectIDCounter.updateOne({},{$inc:{lastServiceID: 1}});
        service.serviceID = newServiceID;

        const data = await upload_Single_Image(buffer);
        service.serviceImageURL = data.url;
        service.serviceImagePublic_ID = data.public_id

        const newService = new Services(service);
        await newService.save();
        res.status(201).json({ success: true, data: newService });

    }
    catch(error){
        console.error("Error saving service:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to save service" });
    }
}

// @desc Get all services
// @route GET /api/services
export const getServices = async (req,res)=>{
    try{
        const services = await Services.find({});
        res.status(200).json({ success: true, data: services });
    }
    catch(error){
        console.error("Error fetching services:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to fetch services" });
    }
}

// @desc Remove service
// @route DELETE /api/services/:id
export const removeService = async(req,res)=>{
    const {id} = req.params;
    try{
        const serviceID = await Services.findOne({_id:id});
        if(!serviceID) return res.status(404).json({success: false, message: 'Project ID is invalid'})
        await serviceID.deleteOne({
            _id:id
        })
        res.status(200).json({success: true, data: serviceID})
    }
    catch(error){
        res.status(500).json({ success: false, message: "Server Error: Failed to delete project" });
    }
}

// @desc Update service
// @route PATCH /api/services/:id
export const editService = async(req,res)=>{
    const {id} = req.params;
    const service = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Service not found" });
    }
    try{
       const updateService = await Services.findByIdAndUpdate(
        id,
        service,
        { new: true }
       )
       
       if (!updateService) {
        return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: updateService });
    }
    catch(error){
        console.error("Error updating job order:", error.message);
        res.status(500).json({ success: false, message: "Server Error: Failed to update Service" });
    }
}

// @desc Update service image
// @route PATCH /api/services/:id
export const editServicewImage = async(req,res)=>{
    const {id} = req.params;
    const service = req.body;
    
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: "No file uploaded" 
        });
    }
    
    const buffer = req.file.buffer;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ 
            success: false, 
            message: "Service not found" 
        });
    }

    try {
        const serviceIDfind = await Services.findById(id);
        if(!serviceIDfind) {
            return res.status(404).json({ 
                success: false, 
                message: "Service not found" 
            });
        }

        const data = await upload_Single_Image(buffer);
        
        const updateServiceData = {
            ...service,
            serviceImageURL: data.url,
            serviceImagePublic_ID: data.public_id
        };

        const updateService = await Services.findByIdAndUpdate(
            id,
            updateServiceData,
            { new: true }
        );
       
        if (!updateService) {
            return res.status(404).json({ 
                success: false, 
                message: "Service not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: updateService 
        });
    }
    catch(error){
        console.error("Error updating service:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: Failed to update Service" 
        });
    }
}
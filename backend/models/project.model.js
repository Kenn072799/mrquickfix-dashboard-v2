import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    projectID:{
        type: String,
        required: false,
        unique: true,
    },
    projectName:{
        type:String,
        required: true
    },
    projectServices:{
        type: Array,
        required: true
    },
    projectThumbnail:{
        type:String,
        required: true
    },
    projectImagesUrl:{
        type: Array,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
})

const Projects = mongoose.model("projects", projectSchema);

export default Projects
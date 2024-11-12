import mongoose from "mongoose";

const projectIDCounterSchema = new mongoose.Schema({
  lastProjectID: {
    type: Number,
    default: 0,
  },
});

const ProjectIDCounter = mongoose.model("ProjectIDCounter", projectIDCounterSchema);

export default ProjectIDCounter;
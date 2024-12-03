import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema({
    serviceID:{
        type: String,
        required: false,
        unique: true,
    },
    serviceName:{
        type:String,
        required: true
    },
    typeofJob:{
        type:String,
        required: true
    },
    serviceImageURL:{
        type:String,
        required: true
    },
    serviceImagePublic_ID:{
        type:String,
        required: true
    },
    serviceDescription:{
        type:String,
        required: true
    }
})

const Services = mongoose.model("services", servicesSchema);
export default Services;
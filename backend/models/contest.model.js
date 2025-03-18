import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    title: {type: String},
    platform: {type: String},
    rawStartTime: {type: Number},
    status: {type: String},
    rawDuration: {type: Number},
    url: {type: String},
    solutionLink: {type: String, default: ""},
});

const Contest = mongoose.model('Contest', contestSchema);

export default Contest;

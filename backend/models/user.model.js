import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, required: true, enum: ['admin', 'user']},
    bookmarkedContests: [ {type: mongoose.Schema.Types.ObjectId , ref: 'Contest'} ],
})

const User = mongoose.model('User', userSchema);

export default User
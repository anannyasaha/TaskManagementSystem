import mongoose from "mongoose";

const tasklistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    file: {
        data: Buffer,  // Stores binary data of the file
        contentType: String // Stores file type (e.g., 'image/png', 'application/pdf')
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    status:{
        type: String,
        enum: ["Working", "Support","Pending","Overdue","New", "Completed"],
        default:"New"
    },
    category:{
        type: String,
        enum: ["Feature Development","Bug Fixing","Code Review","Refactoring","API Development"],
    },
    deadline: {
        type: Date,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserList",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserList",  // User who created the task
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model("TaskList", tasklistSchema);
export default Task;

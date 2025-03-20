import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true  // Ensures no duplicate Employee IDs
    },
    password: {
            type: String,
            required: true,
            minlength: 6  
        },
    email: {
        type: String,
        required: true,
        unique: true,  // Ensures unique emails
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 
    },
    role: {
        type: String,
        enum: ["Director","Manager", "Employee"],  // Limits roles to Manager or Employee or Director
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserList", // Reference to another user (the manager)
        default: null  // If the user is a manager, this field will be null
    }
}, { timestamps: true }); 

const UserList = mongoose.model("UserList", userSchema);
export default UserList;

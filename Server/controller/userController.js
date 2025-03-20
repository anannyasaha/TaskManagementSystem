import UserList from "../model/userModel.js";
import mongoose from 'mongoose';
export const create = async (req, res) => {
    try {
        const { name, employeeId,password, email, role, manager } = req.body;
        // Check if Employee ID or Email already exists
        const existingUser = await UserList.findOne({ $or: [{ employeeId }, { email }] });
        if (existingUser) {
            return res.status(400).json({ errorMessage: "Employee ID or Email already exists." });
        }

        
        if (manager) {
            const manager_found = await UserList.findOne({name:manager});
            const manager_id = new mongoose.Types.ObjectId(manager_found._id);  
            const newUser = new UserList({ name, employeeId,password, email, role, manager:manager_id });
            await newUser.save();
            res.status(201).json({ message: "User created successfully", user: newUser });
            
        }
        else{
            const newUser = new UserList({ name, employeeId,password, email, role, manager });
            await newUser.save();
            console.log(newUser);
    }   
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
export const getAllUsers=async(req,res)=>{
    try {
        const userData=await UserList.find();
        if(!userData||userData.length===0){
            return res.status(404).json({message:"User data not found."});
        }
        res.status(200).json(userData)
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
 
    }
};
export const getTeamMembers=async(req,res)=>{
    try{
    const id=req.params.id;

    const team_members = await UserList.find({ manager: id });
    res.status(200).json(team_members); 
}
    catch(error){
        res.status(200).json({errorMessage: error.message})
    }

}
export const getUserById = async (req, res) => {
    try {
        const id = req.params.id;  // Getting the ID from the request parameters
        const userExist = await UserList.findById(id);  // Find the user by ID in the UserList collection

        if (!userExist) {
            return res.status(404).json({ message: "User not found." });  // If no user found
        }

        res.status(200).json(userExist);  // If user found, send the user data as response
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });  // Handle any errors that occur
    }
};
export const updateUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedUser = await UserList.findByIdAndUpdate(id, req.body, {
            new: true, // Returns the updated document
            runValidators: true, // Ensures validation rules are applied
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        console.log(updatedUser)
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;  // Get the role from query parameters

        if (!role) {
            return res.status(400).json({ message: "Role is required in the query parameter." });
        }

        // Validate role input to prevent incorrect values
        const validRoles = ["Director", "Manager", "Employee"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role. Allowed roles: Director, Manager, Employee." });
        }

        const users = await UserList.find({ role }); // Find users matching the role

        if (!users.length) {
            return res.status(404).json({ message: `No users found for role: ${role}` });
        }

        res.status(200).json(users); // Return the list of users based on role
        
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }

};
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body; // Extract email and password from request

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // Find user by email
        const user = await UserList.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Wrong User ID. Please register." });
        }

        // Check if the password matches
        if (user.password !== password) {
            return res.status(401).json({ message: "Wrong password." });
        }

        // If email and password are correct, return the user's role
        res.status(200).json({ message: "Login successful", role: user.role, name:user.name, id:user._id});

    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
export const deleteUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedUser = await UserList.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
import TaskList from "../model/taskModel.js";
import UserList from "../model/userModel.js";
import { getIO } from "../socket.js";
export const create = async (req, res) => {
    
    try {
       
        const { title, description, priority, status, category, deadline, assignedTo,createdBy } = req.body;
        
        const file = req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : null; // Optional file

        // Check if a task with the same title and assigned user already exists
        const existingTask = await TaskList.findOne({ title, assignedTo });
        console.log(existingTask)
        if (existingTask) {
            return res.status(400).json({ errorMessage: "Task with this title already exists for the same user." });
        }
       
        // Create a new task
        const newTask = new TaskList({
            title,
            description,
            file, // File is optional
            priority,
            status,
            category,
            deadline,
            assignedTo,
            createdBy
        });
        console.log(newTask)
        // Save task to the database
        await newTask.save()
        try {
            getIO().emit("newTask", newTask);
          } catch (error) {
            console.error("Error emitting socket event:", error);
          }
        res.status(201).json(newTask);
    
      
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
export const getAllTasks=async(req,res)=>{
    try {
        const taskData=await TaskList.find();
        if(!taskData||taskData.length===0){
            return res.status(404).json({message:"Task data not found."});
        }
        res.status(200).json(taskData)
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
 
    }
};

export const getTasksbyAssignedto=async(req,res)=>{
    try{
    const {name}=req.query
    const user = await UserList.findOne({name:name}); 
    
    const assignedTasks = await TaskList.find({ assignedTo: user._id });
    const team_members = await UserList.find({ manager: user._id });
    // Extract team member IDs into an array
    const teamMemberIds = team_members.map(member => member._id);

    // Find tasks assigned to any team member
    const teamTasks = await TaskList.find({ assignedTo: { $in: teamMemberIds } });

    // Combine both arrays (user's tasks and team tasks)
    const allTasks = [...assignedTasks, ...teamTasks];
    
    if (!allTasks.length) {
        return res.status(404).json({ message: `No tasks are found for you, ${name}` });
    }

    res.status(200).json(allTasks); // Return the list of users based on role
    
    } catch (error) {
    res.status(500).json({ errorMessage: error.message });
}

};
export const getTaskById=async(req,res)=>{
    try {
        const id=req.params.id;
        const taskExist=await TaskList.findById(id);
        if(!taskExist){
            return res.status(404).json({message:"Task data not found."});    
        }
        res.status(200).json(taskExist)

        
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
export const updateTaskById = async (req, res) => {
    try {
        console.log(req.body)
        const id = req.params.id;
        const updatedTask = await TaskList.findByIdAndUpdate(id, req.body, {
            new: true, // Returns the updated document
            runValidators: true, // Ensures validation rules are applied
        });

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found." });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
export const deleteTaskById = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedTask = await TaskList.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found." });
        }

        res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
        res.status(500).json({ errorMessage: error.message });
    }
};
export const reportbyCategory= async (req, res) => {
  try {
    
    const {name}=req.query
    const user = await UserList.findOne({name:name}); 
    
    const assignedTasks = await TaskList.find({ assignedTo: user._id });
    const team_members = await UserList.find({ manager: user._id });
    
    const teamMemberIds = team_members.map(member => member._id);

    
    const teamTasks = await TaskList.find({ assignedTo: { $in: teamMemberIds } });

    
    const allTasks = [...assignedTasks, ...teamTasks];

    const categoryCount = allTasks.reduce((acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      }, {});
  
      // Target categories
      const targetCategories = [
        "Feature Development",
        "Bug Fixing",
        "Code Review",
        "Refactoring",
        "API Development"
      ];
  
      // Ensure all categories are included with counts
      const report = targetCategories.map(category => ({
        _id: category,
        count: categoryCount[category] || 0
      }));
  
      res.json(report);
    } catch (error) {
      console.error("Error generating category report:", error);
      res.status(500).json({ message: "Error generating report" });
    }
  };
  
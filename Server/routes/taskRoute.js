import express from "express"
import multer from "multer"
import {create, getAllTasks, getTaskById, updateTaskById,getTasksbyAssignedto, deleteTaskById,reportbyCategory} from "../controller/taskController.js"

const router=express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single('file'),create);
router.get("/relevanttasks",getTasksbyAssignedto);
router.get("/alltasks",getAllTasks);
router.get("/task/:id",getTaskById);
router.put("/update/task/:id", updateTaskById); 
router.delete("/delete/tasks/:id", deleteTaskById);
router.get("/categoryReport",reportbyCategory)
export default router;
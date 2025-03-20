import express from "express"

import {create, getAllUsers, getUserById, updateUserById,getUsersByRole,signIn,getTeamMembers, deleteUserById} from "../controller/userController.js"
const router=express.Router();
router.post("/",create);
router.post("/signin", signIn);
router.get("/", getUsersByRole);
router.get("/allusers",getAllUsers);
router.get("/user/:id",getUserById);
router.get("/team/:id",getTeamMembers);
router.put("/update/user/:id", updateUserById);
router.delete("delete/users/:id", deleteUserById);
export default router;
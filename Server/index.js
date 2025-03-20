import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoute.js"
import taskRoutes from "./routes/taskRoute.js"
import http from "http"
import { init } from "./socket.js"
import cors from "cors";

const app=express();
const server=http.createServer(app)
    const io= init(server);
    io.on("connection",(socket)=>{
        console.log("Client Connected");
    })
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
const PORT=process.env.PORT || 700;
const MONGOURL=process.env.MONGO_URL;
app.use(cors({
    origin:"http://localhost:3000",
    methods: ["GET","POST","PUT","DELETE"],    
    allowedHeaders: "Content-Type",    
    credentials: true,                
    preflightContinue: false,          // Let the preflight request be handled by CORS
    optionsSuccessStatus: 200 
}
));
app.use("/api/users",userRoutes)
app.use("/api/tasks",taskRoutes)

mongoose
.connect(MONGOURL)
.then(()=>{
    console.log("DB connected Susccessfully.");
  
    
    })
    .catch((error)=>console.log(error));
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import { io } from "socket.io-client";

const socket = io("http://localhost:8000"); // Adjust backend URL if needed

export default socket;
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import express from "express";

export const app = express();

export const server = http.createServer(app);
export const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});

const userSocket: { [key: string]: string } = {};

export const getUserSocketId = (receiverId: string) => {
    return userSocket[receiverId];
}

// Define a custom type for the 'io' object to include the 'on' and 'emit' methods
interface CustomSocketIO extends SocketIOServer {
    on(event: string, listener: Function): this;
    emit(event: string, ...args: any[]): boolean;
}

// Now, cast 'io' to the custom type to include the 'on' and 'emit' methods
(io as CustomSocketIO).on("connection", (socket: any) => {
    console.log("a user has entered: " + socket.id);
    const userId: string = socket.handshake.query.userId as string;
    console.log("User ID: ", userId);
    
    if (userId !== "undefined") {
        userSocket[userId] = socket.id;
    }
    (io as CustomSocketIO).emit("getOnlineUsers", Object.keys(userSocket));
    
    socket.on("disconnect", () => {
        console.log("user has disconnected: " + socket.id);
        delete userSocket[userId];
        (io as CustomSocketIO).emit("getOnlineUsers", Object.keys(userSocket));    
    });
});

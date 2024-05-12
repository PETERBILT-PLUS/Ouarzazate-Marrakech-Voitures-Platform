"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSocketId = exports.io = exports.server = exports.app = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
exports.server = http_1.default.createServer(exports.app);
exports.io = new socket_io_1.Server(exports.server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    }
});
const userSocket = {};
const getUserSocketId = (receiverId) => {
    return userSocket[receiverId];
};
exports.getUserSocketId = getUserSocketId;
// Now, cast 'io' to the custom type to include the 'on' and 'emit' methods
exports.io.on("connection", (socket) => {
    console.log("a user has entered: " + socket.id);
    const userId = socket.handshake.query.userId;
    console.log("User ID: ", userId);
    if (userId !== "undefined") {
        userSocket[userId] = socket.id;
    }
    exports.io.emit("getOnlineUsers", Object.keys(userSocket));
    socket.on("disconnect", () => {
        console.log("user has disconnected: " + socket.id);
        delete userSocket[userId];
        exports.io.emit("getOnlineUsers", Object.keys(userSocket));
    });
});

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = void 0;
const conversation_model_js_1 = __importDefault(require("../models/conversation.model.js"));
const message_model_js_1 = __importDefault(require("../models/message.model.js"));
const socket_js_1 = require("../socket/socket.js");
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        let conversation = yield conversation_model_js_1.default.findOne({
            participants: { $all: [senderId, receiverId] }
        });
        if (!conversation) {
            conversation = new conversation_model_js_1.default({
                participants: [senderId, receiverId],
            });
        }
        const newMessage = new message_model_js_1.default({
            senderId: senderId,
            receiverId: receiverId,
            message: message,
        });
        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }
        yield Promise.all([conversation.save(), newMessage.save()]).then(() => {
            const receiver = (0, socket_js_1.getUserSocketId)(receiverId);
            if (receiver) {
                socket_js_1.io.to(receiver).emit("newMessage", newMessage);
            }
            res.status(201).json({ success: true, message: newMessage });
        }).catch(() => {
            res.status(500).json({ success: false, message: "Internal Server Error" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.sendMessage = sendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { id: userChatWith } = req.params;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        const conversation = yield conversation_model_js_1.default.findOne({
            participants: { $all: [userChatWith, userId] },
        }).populate("messages");
        if (!conversation)
            return res.status(404).json({ success: false, message: "Conversation not found" });
        res.status(200).json({ success: true, message: "conversation found", Conversations: conversation.messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.getMessages = getMessages;

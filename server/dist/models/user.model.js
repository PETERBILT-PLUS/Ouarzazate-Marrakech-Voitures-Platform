"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userModel = new mongoose_1.default.Schema({
    nom: {
        type: String,
        required: true,
    },
    prenom: {
        type: String,
        required: true,
    },
    sexe: {
        type: String,
        required: true,
        enum: ["male", "female"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [emailRegex, "Invalid email format"],
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("User", userModel);

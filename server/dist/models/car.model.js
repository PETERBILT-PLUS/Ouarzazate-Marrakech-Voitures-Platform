"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.carSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    carModel: {
        type: Number,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    availability: {
        type: String,
        enum: ["disponible", "en charge"],
        required: true
    },
    carKm: {
        type: Number,
        required: true
    },
    carType: {
        type: String,
        required: true
    },
    carMarque: {
        type: String,
        required: true
    },
    carCity: {
        type: String,
        required: true
    },
    carImages: {
        type: [String],
        required: true
    },
    accepted: {
        type: Boolean,
        default: false, // Default value, assuming reservations start as pending
    },
    reservationTime: {
        type: Date,
        default: null, // Default to the current time when the reservation is made
    },
    returnTime: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});
exports.default = mongoose_1.default.model("Car", exports.carSchema);

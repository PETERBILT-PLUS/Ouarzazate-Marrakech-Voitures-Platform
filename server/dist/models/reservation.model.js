"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const car_model_1 = require("./car.model");
const reservationSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cars: [car_model_1.carSchema],
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Reservation", reservationSchema);

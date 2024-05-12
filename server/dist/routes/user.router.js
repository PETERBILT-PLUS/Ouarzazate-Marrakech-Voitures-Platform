"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_js_1 = require("../controllers/user.controller.js");
const userRouter = express_1.default.Router();
userRouter.get("/get-cars", user_controller_js_1.getUserCars);
userRouter.get("/get-names", user_controller_js_1.getNames);
userRouter.get("/get-maximum-and-minimum", user_controller_js_1.getMaximumAndMinimum);
exports.default = userRouter;

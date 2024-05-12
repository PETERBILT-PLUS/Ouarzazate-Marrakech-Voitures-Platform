"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const isAdmin_js_1 = require("../middleware/isAdmin.js");
const adminRouter = express_1.default.Router();
adminRouter.post("/add-admin", admin_controller_js_1.addAdmin);
adminRouter.post("/add-car", isAdmin_js_1.isAdmin, admin_controller_js_1.addCar);
exports.default = adminRouter;

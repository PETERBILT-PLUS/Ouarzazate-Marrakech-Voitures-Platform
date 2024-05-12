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
exports.checkState = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_model_js_1 = __importDefault(require("../models/admin.model.js"));
const checkState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(401).json({ success: false, message: "Pas Autorisé" });
        const JWT_SECRET = process.env.JWT_SECRET || "";
        if (!JWT_SECRET) {
            throw new Error("The JWT_SECRET is not available, please check the .env file");
        }
        const decode = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decode)
            return res.status(401).json({ success: false, message: "Pas Autorisé" });
        const adminExist = yield admin_model_js_1.default.findById(decode.userId);
        if (adminExist) {
            res.status(200).json({ success: true, isAdmin: true });
        }
        else {
            res.status(200).json({ success: true, isAdmin: false });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.checkState = checkState;

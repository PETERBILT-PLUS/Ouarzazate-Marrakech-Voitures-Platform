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
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const admin_model_js_1 = __importDefault(require("../models/admin.model.js"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nom, prenom, sexe, email, password } = req.body;
        const JWT_SECRET = process.env.JWT_SECRET || "";
        const DEVELOPMENT_MODE = process.env.DEVELOPMENT_MODE || "";
        if (!JWT_SECRET) {
            throw new Error("The JWT_SECRET is not available, please check the .env file");
        }
        if (!DEVELOPMENT_MODE) {
            throw new Error("The DEVELOPMENT_MODE is not available, please check the .env file");
        }
        if (!nom || !prenom || !sexe || !email || !password)
            return res.status(403).json({ success: false, message: "Informations manquantes" });
        const emailIsSigned = yield user_model_js_1.default.findOne({ email: email });
        if (emailIsSigned) {
            const isPasswordCorrect = yield bcrypt_1.default.compare(password, emailIsSigned.password);
            if (isPasswordCorrect) {
                const token = jsonwebtoken_1.default.sign({ userId: emailIsSigned._id }, JWT_SECRET, { expiresIn: "60d" });
                res.status(200).cookie("token", token, {
                    maxAge: 1000 * 60 * 60 * 24 * 60,
                    secure: DEVELOPMENT_MODE === "development" ? false : true,
                    httpOnly: true,
                    sameSite: "strict",
                }).json({ success: true, message: "Utilisateur connecté avec succès" });
            }
            else {
                return res.status(409).json({ success: false, message: "Cet email est déjà utilisé" });
            }
            return false;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPass = yield bcrypt_1.default.hash(password, salt);
        const newUser = new user_model_js_1.default({
            nom: nom,
            prenom: prenom,
            sexe: sexe,
            email: email,
            password: hashedPass,
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "60d" });
        yield newUser.save().then(() => {
            res.status(201).cookie("token", token, {
                maxAge: 1000 * 60 * 60 * 24 * 60,
                secure: DEVELOPMENT_MODE === "development" ? false : true,
                httpOnly: true,
                sameSite: "strict",
            }).json({ success: true, message: "Utilisateur créé avec succès" });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Erreur interne du serveur" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const JWT_SECRET = process.env.JWT_SECRET || "";
        const DEVELOPMENT_MODE = process.env.DEVELOPMENT_MODE || "";
        if (!JWT_SECRET) {
            throw new Error("The JWT_SECRET is not available, please check the .env file");
        }
        if (!DEVELOPMENT_MODE) {
            throw new Error("The DEVELOPMENT_MODE is not available, please check the .env file");
        }
        const adminExist = yield admin_model_js_1.default.findOne({ email: email });
        if (adminExist) {
            const passwordIsMatch = yield bcrypt_1.default.compare(password, adminExist.password);
            if (!passwordIsMatch)
                return res.status(401).json({ success: false, message: "Pas Autorisé" });
            const token = jsonwebtoken_1.default.sign({ adminId: adminExist._id }, JWT_SECRET, { expiresIn: "60d" });
            res.status(200).cookie("token", token, {
                maxAge: 1000 * 60 * 60 * 24 * 60,
                secure: DEVELOPMENT_MODE === "development" ? false : true,
                httpOnly: true,
                sameSite: "strict",
            });
            res.status(200).json({ success: true, message: "Login Admin Succès", navigate: "localhost:5173/admin", isAdmin: true });
            return false;
        }
        const userExist = yield user_model_js_1.default.findOne({ email: email });
        if (!userExist)
            return res.status(404).json({ success: false, message: "Utilisateur pas trouvé" });
        const passwordIsMatch = yield bcrypt_1.default.compare(password, userExist.password);
        if (!passwordIsMatch)
            return res.status(401).json({ success: false, message: "Pas Autorisé" });
        const token = jsonwebtoken_1.default.sign({ userId: userExist._id }, JWT_SECRET, { expiresIn: "60d" });
        res.status(200).cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 60,
            secure: DEVELOPMENT_MODE === "development" ? false : true,
            httpOnly: true,
            sameSite: "strict",
        });
        res.status(200).json({ success: true, message: "Login Succès" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.login = login;

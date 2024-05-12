import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model.js";
import adminModel, { IAdmin } from "../models/admin.model.js";


export const register = async (req: Request, res: Response) => {
    try {
        const { nom, prenom, sexe, email, password } = req.body;

        const JWT_SECRET: string = process.env.JWT_SECRET || "";
        const DEVELOPMENT_MODE: string = process.env.DEVELOPMENT_MODE || "";
        if (!JWT_SECRET) {
            throw new Error("The JWT_SECRET is not available, please check the .env file");
        }
        if (!DEVELOPMENT_MODE) {
            throw new Error("The DEVELOPMENT_MODE is not available, please check the .env file");
        }

        if (!nom || !prenom || !sexe || !email || !password) return res.status(403).json({ success: false, message: "Informations manquantes" });

        const emailIsSigned = await User.findOne({ email: email });
        if (emailIsSigned) {
            const isPasswordCorrect = await bcrypt.compare(password, emailIsSigned.password);
            if (isPasswordCorrect) {
                const token: string = jwt.sign({ userId: emailIsSigned._id }, JWT_SECRET, { expiresIn: "60d" });
                res.status(200).cookie("token", token, {
                    maxAge: 1000 * 60 * 60 * 24 * 60,
                    secure: DEVELOPMENT_MODE === "development" ? false : true,
                    httpOnly: true,
                    sameSite: "strict",
                }).json({ success: true, message: "Utilisateur connecté avec succès" });
            } else {
                return res.status(409).json({ success: false, message: "Cet email est déjà utilisé" });
            }
            return false;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = new User({
            nom: nom,
            prenom: prenom,
            sexe: sexe,
            email: email,
            password: hashedPass,
        });

        const token: string = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "60d" });
        await newUser.save().then(() => {
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
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
}


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const JWT_SECRET: string = process.env.JWT_SECRET || "";
        const DEVELOPMENT_MODE: string = process.env.DEVELOPMENT_MODE || "";
        if (!JWT_SECRET) {
            throw new Error("The JWT_SECRET is not available, please check the .env file");
        }
        if (!DEVELOPMENT_MODE) {
            throw new Error("The DEVELOPMENT_MODE is not available, please check the .env file");
        }

        const adminExist: IAdmin | null = await adminModel.findOne({ email: email });
        if (adminExist) {
            const passwordIsMatch = await bcrypt.compare(password, adminExist.password);
            if (!passwordIsMatch) return res.status(401).json({ success: false, message: "Pas Autorisé" });
            const token: string = jwt.sign({ adminId: adminExist._id }, JWT_SECRET, { expiresIn: "60d" });
            res.status(200).cookie("token", token, {
                maxAge: 1000 * 60 * 60 * 24 * 60,
                secure: DEVELOPMENT_MODE === "development" ? false : true,
                httpOnly: true,
                sameSite: "strict",
            });
            res.status(200).json({ success: true, message: "Login Admin Succès", navigate: "localhost:5173/admin", isAdmin: true });
            return false;
        }

        const userExist: IUser | null = await User.findOne({ email: email });
        if (!userExist) return res.status(404).json({ success: false, message: "Utilisateur pas trouvé" });
        const passwordIsMatch = await bcrypt.compare(password, userExist.password);
        if (!passwordIsMatch) return res.status(401).json({ success: false, message: "Pas Autorisé" });
        const token: string = jwt.sign({ userId: userExist._id }, JWT_SECRET, { expiresIn: "60d" });
        res.status(200).cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 24 * 60,
            secure: DEVELOPMENT_MODE === "development" ? false : true,
            httpOnly: true,
            sameSite: "strict",
        });
        res.status(200).json({ success: true, message: "Login Succès" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import adminModel from "../models/admin.model";


declare global {
    namespace Express {
        interface Request {
            admin?: any,
        }
    }
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ success: false, message: "Pas Autorisé" });

        const JWT_SECRET: string = process.env.JWT_SECRET || "";
        if (!JWT_SECRET) {
            throw new Error("The JWT_SECRET is not available, please check the .env file");
        }

        const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!decode) return res.status(401).json({ success: false, message: "Pas Autorisé" });

        const adminExist = await adminModel.findById(decode.userId);
        if (!adminExist) return res.status(404).json({ success: false, message: "Admin Pas Trouvé" });

        req.admin = adminExist;
        next();

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user.model.js";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: any,
        }
    }
}


export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) return res.status(403).json({ success: true, message: "Pas de Token Veiller Login" });

        const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error("the JWT_SECRET is not available please check the .env file");
        }

        const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!decode) return res.status(403).json({ success: false, message: "Token Incorrect Veiller Inscrire" });

        const user = await User.findById(decode.userId) as IUser;
        if (!user) return res.status(404).json({ success: false, message: "utilisateur Pas Trouvé" });

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ success: true, messge: "Internal Server Error" });
    }
}
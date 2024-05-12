import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    nom: string;
    prenom: string;
    sexe: "male" | "female";
    email: string;
    password: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userModel = new mongoose.Schema<IUser>({
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

export default mongoose.model<IUser>("User", userModel);

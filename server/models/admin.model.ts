import mongoose from "mongoose";

export interface IAdmin extends mongoose.Document {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    phoneNumber: string;
    // Add any other admin-specific fields here
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminSchema = new mongoose.Schema<IAdmin>({
    nom: {
        type: String,
        required: true,
    },
    prenom: {
        type: String,
        required: true,
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
    phoneNumber: {
        type: String,
        required: true,
    },
    // Define any other admin-specific fields
}, {
    timestamps: true,
});

export default mongoose.model<IAdmin>("Admin", adminSchema);

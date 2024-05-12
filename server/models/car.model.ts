import mongoose, { Document } from "mongoose";

export interface ICar extends Document {
    name: string;
    description: string;
    carModel: number;
    pricePerDay: number;
    availability: "disponible" | "en charge";
    carKm: number;
    carType: string;
    carMarque: string;
    carCity: string,
    carImages: string[];
    accepted?: boolean; // Optional field
    reservationTime?: Date; // Optional field
    returnTime?: Date; // Optional field
}

export const carSchema = new mongoose.Schema<ICar>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    carModel: {
        type: Number,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    availability: {
        type: String,
        enum: ["disponible", "en charge"],
        required: true
    },
    carKm: {
        type: Number,
        required: true
    },
    carType: {
        type: String,
        required: true
    },
    carMarque: {
        type: String,
        required: true
    },
    carCity: {
        type: String,
        required: true
    },
    carImages: {
        type: [String],
        required: true
    },
    accepted: {
        type: Boolean,
        default: false, // Default value, assuming reservations start as pending
    },
    reservationTime: {
        type: Date,
        default: null, // Default to the current time when the reservation is made
    },
    returnTime: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

export default mongoose.model<ICar>("Car", carSchema);

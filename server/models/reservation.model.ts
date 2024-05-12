import mongoose, { Document } from "mongoose";
import { ICar, carSchema } from "./car.model";

export interface IReservation extends Document {
    user: mongoose.Types.ObjectId;
    cars: ICar[];
}

const reservationSchema = new mongoose.Schema<IReservation>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cars: [carSchema],
}, {
    timestamps: true,
});

export default mongoose.model<IReservation>("Reservation", reservationSchema);

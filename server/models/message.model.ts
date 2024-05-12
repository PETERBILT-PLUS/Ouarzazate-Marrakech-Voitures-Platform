import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
    senderId: mongoose.Schema.Types.ObjectId,
    receiverId: mongoose.Schema.Types.ObjectId,
    message: string,
}

const MessageShema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export default mongoose.model<IMessage>("Message", MessageShema);
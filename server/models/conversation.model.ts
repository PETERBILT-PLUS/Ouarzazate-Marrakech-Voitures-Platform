import mongoose, { Document } from "mongoose";

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    messages: mongoose.Types.ObjectId[];
}

const ConversationSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: [],
        },
    ],
});

export default mongoose.model<IConversation>("Conversation", ConversationSchema);
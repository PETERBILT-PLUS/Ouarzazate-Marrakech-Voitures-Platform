import mongoose from "mongoose";

const connection = async () => {
    const MONGO_URI: string | undefined = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error("the MONGO_URI is not available please check the .env file");
    }
    try {
        await mongoose.connect(MONGO_URI).then(() => {
            console.log("Database Connected");
        }).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}

export default connection;
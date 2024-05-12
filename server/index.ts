import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connection from "./db/connectToDatabase.js";
import { app, server } from "./socket/socket.js";
import adminRouter from "./routes/admin.router.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.router.js";
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());

const PORT: number | string = process.env.PORT || 5000;

app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/user", userRouter);


server.listen(PORT, async () => {
    await connection();
    console.log(`server is running on port ${PORT}`);
});
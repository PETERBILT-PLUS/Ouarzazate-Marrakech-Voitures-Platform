import express from "express";
import { getMaximumAndMinimum, getNames, getUserCars } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/get-cars", getUserCars);
userRouter.get("/get-names", getNames);
userRouter.get("/get-maximum-and-minimum", getMaximumAndMinimum);

export default userRouter;
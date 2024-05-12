import express from "express";
import { addAdmin, addCar } from "../controllers/admin.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/add-admin", addAdmin);
adminRouter.post("/add-car", isAdmin, addCar);

export default adminRouter;
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import Conversation, { IConversation } from "../models/conversation.model.js";
import userModel, { IUser } from "../models/user.model.js";
import carsModel, { ICar } from "../models/car.model.js";
import reservationModel, { IReservation } from "../models/reservation.model.js";
import conversationModel from "../models/conversation.model.js";
import messageModel, { IMessage } from "../models/message.model.js";
import adminModel, { IAdmin } from "../models/admin.model.js";


export const getConversations = async (req: Request, res: Response) => {
    try {
        // Assuming the admin is identified by userId in the request
        const adminId = req.admin._id;

        // Find conversations where the admin is a participant and populate the participants field
        const conversations = await Conversation.find({ participants: adminId }).populate('participants');
        console.log(conversations);
        return res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error("Error in getConversations controller:", error);
        return res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const adminId = req.admin._id;
        const { userId } = req.body;

        if (!adminId) return res.status(401).json({ success: false, message: "Pas Autorisé" });

        const user: IUser | null = await userModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Utilisateur Pas Trouvé" });

        res.status(200).json({ success: true, user: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne su Serveur" });
    }
}

export const getAllCars = async (req: Request, res: Response) => {
    try {
        const cars: ICar[] | null = await carsModel.find({});
        if (cars.length === 0 || !cars) return res.status(404).json({ success: false, message: "Pas De Vehicules" });

        res.status(200).json({ success: true, cars: cars });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const addCar = async (req: Request, res: Response) => {
    try {
        const { name, description, carModel, pricePerDay, availability, carKm, carType, carMarque, carCity, carImages } = req.body;

        if (!name || !description || !carModel || !pricePerDay || !availability || !carKm || !carType || !carMarque || !carCity || !carImages) {
            return res.status(400).json({ success: false, message: "Inforamtions Missée" });
        }

        console.log(carModel);
        const car: ICar = new carsModel({
            name: name,
            description: description,
            carModel: carModel,
            pricePerDay: pricePerDay,
            availability: availability,
            carKm: carKm,
            carType: carType,
            carMarque: carMarque,
            carCity: carCity,
            carImages: carImages
        });
        await car.save().then(() => {
            res.status(201).json({ success: true, message: "Vehicule Crée avec Succès" });
        }).catch((error: any) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Erreur D'enregistrement Du Vehicule" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const getVehiculeDetails = async (req: Request, res: Response) => {
    try {
        const { carId } = req.body;

        if (!carId) return res.status(400).json({ success: false, message: "_id du voiture est manquant" });

        const car: ICar | null = await carsModel.findById(carId);
        if (!car) return res.status(404).json({ success: false, message: "Vehicule Pas Trouvé" });

        res.status(200).json({ success: true, car: car });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const deleteCar = async (req: Request, res: Response) => {
    try {
        const { carId } = req.body;

        if (!carId) return res.status(400).json({ success: false, message: "_id du véhicule est manquant" });

        const car: ICar | null = await carsModel.findByIdAndDelete(carId);
        if (!car) return res.status(404).json({ success: false, message: "Véhicule Non Trouvé" });

        res.status(200).json({ success: true, message: "Véhicule Supprimé avec Succès" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const updateCar = async (req: Request, res: Response) => {
    try {
        const { carId, name, description, type, carModel, pricePerDay, availability, carKm, carType, carMarque, carCity, carImages } = req.body;

        if (!carId || !name || !description || !type || !carModel || !pricePerDay || !availability || !carKm || !carType || !carMarque || !carCity || !carImages) {
            return res.status(400).json({ success: false, message: "Inforamtions Missée" });
        }

        const newCar: ICar = await carModel.findByIdAndUpdate(carId, {
            name, description, type, carModel, pricePerDay, availability, carKm, carType, carMarque, carCity, carImages
        });

        await newCar.save().then(() => {
            res.status(200).json({ success: true, message: "Vehicule Améloré avec Succès" });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Erreur D'amélioration Du Vehicule" });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const getReservations = async (req: Request, res: Response) => {
    try {
        const reservations: IReservation[] = await reservationModel.find({});
        if (reservations.length === 0) return res.status(200).json({ success: true, message: "Pas de Reservations" });
        res.status(200).json({ success: true, reservations: reservations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const acceptReservation = async (req: Request, res: Response) => {
    //repair
    try {
        const { userId, carId } = req.body;

        if (!userId || !carId) return res.status(401).json({ success: false, message: "Manque D'informations" });

        const reservationExist: IReservation | null = await reservationModel.findOne({ user: userId });

        if (reservationExist) {
            const carExist = reservationExist.cars.find((elem) => elem._id == carId);
            if (carExist) return res.status(409).json({ success: false, message: "voiture déja reservé" });
            reservationExist.cars.push(carId);
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const rejectReservation = async (req: Request, res: Response) => {
    try {
        const { userId, carId } = req.body;

        if (!userId || !carId) return res.status(401).json({ success: false, message: "Manque D'informations" });

        const reservation: IReservation | null = await reservationModel.findOne({ user: userId });
        if (!reservation) return res.status(404).json({ success: false, message: "Reservation Pas Trouvé" });

        const car: ICar | undefined | null = reservation.cars.find((elem) => String(elem._id) === carId);
        if (!car) return res.status(404).json({ success: false, message: "Vehicule Pas Trouvé" });

        car.accepted = true;
        await reservation.save().then((reservation: IReservation) => {
            res.status(200).json({ success: true, message: "Reservation Annulé avec Succès" });
        }).catch((error: any) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const getChatConversations = async (req: Request, res: Response) => {
    try {
        const adminId = req.admin._id;

        const chatConversation: IConversation[] | null = await conversationModel.find({ participants: { $in: adminId } }).populate("participant");
        if (!chatConversation) return res.status(404).json({ success: true, message: "Pas de Conversations" });

        let participants: string[] = [];

        chatConversation.forEach((elem: any) => {
            participants = participants.concat(elem.participant);
        });

        participants = [...new Set(participants)];

        const users: IUser[] = await userModel.find({ _id: { $in: participants } });
        if (!users) return res.status(404).json({ success: false, message: "Pas de Conversations" });

        res.status(200).json({ success: true, users: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const getMessage = async (req: Request, res: Response) => {
    try {
        const adminId = req.admin._id;
        const { userId } = req.body;

        if (!userId) return res.status(401).json({ success: false, message: "_id user est manquant" });

        const conversation: IConversation | null = await conversationModel.findOne({ participants: { $all: [adminId, userId] } });
        if (!conversation) return res.status(404).json({ success: false, message: "Pas Des Conversation" });

        const messages: IMessage[] | null = await conversationModel.find({ participants: { $in: [adminId, userId] } }).populate("messages");
        if (!messages) return res.status(404).json({ success: false, message: "Pas Des Messages" });

        res.status(200).json({ success: true, messages: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const adminId = req.admin._id;
        const { userId, message } = req.body;

        if (!userId || !message) return res.status(401).json({ success: false, message: "Manque d'informations" });

        const newMessage: IMessage = new messageModel({ senderId: adminId, receiverId: userId, message: message });

        await newMessage.save().then((message: IMessage) => {
            res.status(201).json({ success: true, message: "Message crée avec Succès" });
        }).catch((error: any) => {
            console.error(error);
            res.status(500).json({ success: false, message: "Erreur aux cours d'enregistrer le message" });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const addAdmin = async (req: Request, res: Response) => {
    try {
        const { nom, prenom, phoneNumber, email, password } = req.body;

        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(password, salt);

        const admin: IAdmin = new adminModel({ nom, prenom, phoneNumber, email, password: hashedPass });

        await admin.save().then(() => {
            res.status(201).json({ success: true });
        }).catch((error: any) => {
            res.status(500).json({ success: false });
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}
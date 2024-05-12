import { Request, Response } from "express";
import reservationModel, { IReservation } from "../models/reservation.model.js";
import userModel, { IUser } from "../models/user.model.js";
import conversationModel, { IConversation } from "../models/conversation.model.js";
import messageModel, { IMessage } from "../models/message.model.js";
import { getUserSocketId, io } from "../socket/socket.js";
import carsModel, { ICar } from "../models/car.model.js"
import mongoose, { ObjectId } from "mongoose";


export const getAllUserReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;

        const reservation = await reservationModel.findOne({ user: userId });
        if (!reservation) return res.status(404).json({ success: true, message: "Pas de Reservations" });

        const cars: ICar[] | null = reservation.cars;
        if (cars.length === 0 || !cars) return res.status(404).json({ success: true, message: "Pas de Voitures Reservé" });

        res.status(200).json({ success: true, cars: cars });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const getMaximumAndMinimum = async (req: Request, res: Response) => {
    try {
        const pipeline: any[] = [
            {
                $group: {
                    _id: null,
                    maxPrice: { $max: "$pricePerDay" },
                    minPrice: { $min: "$pricePerDay" },
                    maxYear: { $max: "$carModel" },
                    minYear: { $min: "$carModel" }
                }
            }
        ];

        const result = await carsModel.aggregate(pipeline);

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Aucune voiture trouvée" });
        }

        const { maxPrice, minPrice, maxYear, minYear } = result[0];

        res.status(200).json({ success: true, maxPrice, minPrice, maxYear, minYear });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
};

export const getNames = async (req: Request, res: Response) => {
    try {
        const names: string[] | null = await carsModel.distinct("name");
        if (names.length === 0 || !names) return res.status(404).json({ success: false, message: "Pas De Nom" });

        res.status(200).json({ success: true, names: names });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du  Serveur" });
    }
}

export const getUserCars = async (req: Request, res: Response) => {
    try {
        const { carName, minCarKm, maxCarKm, carCity, cursor } = req.query;

        let query: any = cursor ? { _id: { $gt: new mongoose.Types.ObjectId(cursor.toString()) } } : {};

        console.log(cursor ? cursor : "nothing man");

        const pipeline: any[] = [];

        // Match stage to filter by name, carKm, and carCity
        if (carName) {
            pipeline.push({ $match: { name: { $regex: carName, $options: 'i' } } });
        }
        if (minCarKm && maxCarKm) {
            pipeline.push({ $match: { carKm: { $gte: parseInt(minCarKm as string), $lte: parseInt(maxCarKm as string) } } });
        }
        if (carCity) {
            pipeline.push({ $match: { carCity } });
        }

        // Add stages for random sampling
        if (typeof cursor === 'string' && cursor) {
            pipeline.push({ $match: query });
        }

        pipeline.push({ $sample: { size: 10 } }); // Adjust the size as needed

        // Aggregate query
        const cars: ICar[] | null = await carsModel.aggregate(pipeline);
        if (!cars || cars.length === 0) return res.status(404).json({ success: false, message: "No cars found" });

        const nextCursor: string | undefined = cars.length > 0 ? cars[cars.length - 1]._id.toString() : undefined;

        res.status(200).json({ success: true, cars, cursor: nextCursor });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const addReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { carId, reservationTime, returnTime } = req.body;

        if (!carId || reservationTime || !returnTime) return res.status(401).json({ success: false, message: "Manque D'informations" });

        const reservationExist: IReservation | null = await reservationModel.findOne({ user: userId });

        if (reservationExist) {
            const carExist = reservationExist.cars.find((elem) => String(elem._id) === carId);
            if (carExist) return res.status(409).json({ success: false, message: "voiture déja reservé" });
            const car: ICar | null = await carsModel.findById(carId);
            if (!car) return res.status(404).json({ success: false, message: "Voiture Pas Trouvé" });
            car.reservationTime = reservationTime;
            car.returnTime = returnTime;
            reservationExist.cars.push(carId);
            await reservationExist.save().then((reservation: any) => {
                res.status(201).json({ success: true, message: "Réservation Enregistrer" });
            }).catch((error: any) => {
                console.log(error);
                res.status(500).json({ success: false, message: "Erreur D'enregistrer la Réservation" });
            })
            return false;
        }

        const car: ICar | null = await carsModel.findById(carId);

        const reservation: IReservation = new reservationModel({
            user: userId,
            cars: [car],
        });

        await reservation.save().then(() => {
            res.status(201).json({ success: true, message: "Reservation Crée avec Succès" });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Reservation Enregistremant Pas Succès" })
        })
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const cancelReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { carId } = req.body;

        const reservation = await reservationModel.findOne({ user: userId });
        if (!reservation) return res.status(404).json({ success: false, message: "Pas de Reservation avec cet _id" });

        const car: ICar | undefined = reservation.cars.find((elem) => String(elem._id) === String(carId));
        if (!car) return res.status(404).json({ success: false, message: "Voiture Pas Trouvé" });

        car.accepted = false;
        await reservation.save().then((reservation: IReservation) => {
            res.status(204).json({ success: true, message: "Reservation annulé avec Succès" });
        }).catch((error: any) => {
            console.error(error);
            res.status(500).json({ success: false, message: "Erreur aux cours de l'anulation de reservation" });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const deleteReservation = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { carId } = req.body;

        if (!carId) return res.status(401).json({ success: false, message: "voiture _id est manquant" });

        const reservation: IReservation | null = await reservationModel.findOne({ user: userId });
        if (!reservation) return res.status(404).json({ success: false, message: "Reservation Pas Trouvé" });

        if (reservation.cars.length === 0 || !reservation.cars) return res.status(404).json({ success: false, message: "Pas de Voiture Réservé" });
        let newCars: ICar[] | undefined | null = reservation.cars;
        newCars = newCars.filter((elem) => String(elem._id) !== carId);

        res.status(200).json({ success: true, cars: newCars });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;

        const user: IUser | null = await userModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "Utilisateur pas Trouvé" });

        res.status(200).json({ success: true, user: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { nom, prenom, sexe, email, password } = req.body;

        if (!nom || !prenom || !sexe || !email || !password) return res.status(401).json({ success: false, message: "Manque D'informations" });

        const user: IUser | null = await userModel.findByIdAndUpdate(userId, {
            nom: nom,
            prenom: prenom,
            sexe: sexe,
            email: email,
            password: password
        });
        if (!user) return res.status(404).json({ success: false, message: "Utilisateur pas Trouvé" });

        res.status(200).json({ success: true, message: "Profile Amélioré" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreurn Interne du Serveur" });
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { receiverId, message } = req.body;

        const conversationExist: IConversation | null = await conversationModel.findOne({ participants: { $all: [userId, receiverId] } });
        if (conversationExist) {
            const newMessage: IMessage = new messageModel({
                senderId: userId,
                receiverId: receiverId,
                message: message
            });

            await newMessage.save().then(async (message: IMessage) => {
                conversation.messages.push(message._id);
                await conversation.save().then((conversation: IConversation) => {
                    res.status(201).json({ success: true, message: "Message Crée avec Succès" });
                }).catch((error) => {
                    console.error(error);
                    res.status(500).json({ success: false, message: "Erreur aux cours d'enregistrer le message" });
                })
                res.status(201).json({ success: true, message: "Message envoyé avec Succès" });
            }).catch((error) => {
                console.error(error);
                res.status(500).json({ success: false, message: "Erreur aux cours d'enregistrer le message" });
            });
            return false;
        }

        const newMessage: IMessage = new messageModel({
            senderId: userId,
            receiverId: receiverId,
            message: message,
        });

        const conversation: IConversation = new conversationModel({
            participants: [userId, receiverId],
            messages: [newMessage._id]
        });

        await Promise.all([newMessage.save(), conversation.save()]).then(() => {
            res.status(201).json({ success: true, message: "Message envoye avec Succès" });
            const userSocket = getUserSocketId(userId);
            io.to(userSocket).emit("newMessage", newMessage);
        }).catch((error: any) => {
            console.error(error);
            res.status(500).json({ success: false, message: "Erreur Interne aux cours d'enregistrer le message" });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
}
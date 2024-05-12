"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.updateUserProfile = exports.getUserProfile = exports.deleteReservation = exports.cancelReservation = exports.addReservation = exports.getUserCars = exports.getNames = exports.getMaximumAndMinimum = exports.getAllUserReservation = void 0;
const reservation_model_js_1 = __importDefault(require("../models/reservation.model.js"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const conversation_model_js_1 = __importDefault(require("../models/conversation.model.js"));
const message_model_js_1 = __importDefault(require("../models/message.model.js"));
const socket_js_1 = require("../socket/socket.js");
const car_model_js_1 = __importDefault(require("../models/car.model.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const getAllUserReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const reservation = yield reservation_model_js_1.default.findOne({ user: userId });
        if (!reservation)
            return res.status(404).json({ success: true, message: "Pas de Reservations" });
        const cars = reservation.cars;
        if (cars.length === 0 || !cars)
            return res.status(404).json({ success: true, message: "Pas de Voitures Reservé" });
        res.status(200).json({ success: true, cars: cars });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getAllUserReservation = getAllUserReservation;
const getMaximumAndMinimum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipeline = [
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
        const result = yield car_model_js_1.default.aggregate(pipeline);
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Aucune voiture trouvée" });
        }
        const { maxPrice, minPrice, maxYear, minYear } = result[0];
        res.status(200).json({ success: true, maxPrice, minPrice, maxYear, minYear });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getMaximumAndMinimum = getMaximumAndMinimum;
const getNames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const names = yield car_model_js_1.default.distinct("name");
        if (names.length === 0 || !names)
            return res.status(404).json({ success: false, message: "Pas De Nom" });
        res.status(200).json({ success: true, names: names });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du  Serveur" });
    }
});
exports.getNames = getNames;
const getUserCars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { carName, minCarKm, maxCarKm, carCity, cursor } = req.query;
        let query = cursor ? { _id: { $gt: new mongoose_1.default.Types.ObjectId(cursor.toString()) } } : {};
        console.log(cursor ? cursor : "nothing man");
        const pipeline = [];
        // Match stage to filter by name, carKm, and carCity
        if (carName) {
            pipeline.push({ $match: { name: { $regex: carName, $options: 'i' } } });
        }
        if (minCarKm && maxCarKm) {
            pipeline.push({ $match: { carKm: { $gte: parseInt(minCarKm), $lte: parseInt(maxCarKm) } } });
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
        const cars = yield car_model_js_1.default.aggregate(pipeline);
        if (!cars || cars.length === 0)
            return res.status(404).json({ success: false, message: "No cars found" });
        const nextCursor = cars.length > 0 ? cars[cars.length - 1]._id.toString() : undefined;
        res.status(200).json({ success: true, cars, cursor: nextCursor });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
exports.getUserCars = getUserCars;
const addReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { carId, reservationTime, returnTime } = req.body;
        if (!carId || reservationTime || !returnTime)
            return res.status(401).json({ success: false, message: "Manque D'informations" });
        const reservationExist = yield reservation_model_js_1.default.findOne({ user: userId });
        if (reservationExist) {
            const carExist = reservationExist.cars.find((elem) => String(elem._id) === carId);
            if (carExist)
                return res.status(409).json({ success: false, message: "voiture déja reservé" });
            const car = yield car_model_js_1.default.findById(carId);
            if (!car)
                return res.status(404).json({ success: false, message: "Voiture Pas Trouvé" });
            car.reservationTime = reservationTime;
            car.returnTime = returnTime;
            reservationExist.cars.push(carId);
            yield reservationExist.save().then((reservation) => {
                res.status(201).json({ success: true, message: "Réservation Enregistrer" });
            }).catch((error) => {
                console.log(error);
                res.status(500).json({ success: false, message: "Erreur D'enregistrer la Réservation" });
            });
            return false;
        }
        const car = yield car_model_js_1.default.findById(carId);
        const reservation = new reservation_model_js_1.default({
            user: userId,
            cars: [car],
        });
        yield reservation.save().then(() => {
            res.status(201).json({ success: true, message: "Reservation Crée avec Succès" });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Reservation Enregistremant Pas Succès" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.addReservation = addReservation;
const cancelReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { carId } = req.body;
        const reservation = yield reservation_model_js_1.default.findOne({ user: userId });
        if (!reservation)
            return res.status(404).json({ success: false, message: "Pas de Reservation avec cet _id" });
        const car = reservation.cars.find((elem) => String(elem._id) === String(carId));
        if (!car)
            return res.status(404).json({ success: false, message: "Voiture Pas Trouvé" });
        car.accepted = false;
        yield reservation.save().then((reservation) => {
            res.status(204).json({ success: true, message: "Reservation annulé avec Succès" });
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ success: false, message: "Erreur aux cours de l'anulation de reservation" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.cancelReservation = cancelReservation;
const deleteReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { carId } = req.body;
        if (!carId)
            return res.status(401).json({ success: false, message: "voiture _id est manquant" });
        const reservation = yield reservation_model_js_1.default.findOne({ user: userId });
        if (!reservation)
            return res.status(404).json({ success: false, message: "Reservation Pas Trouvé" });
        if (reservation.cars.length === 0 || !reservation.cars)
            return res.status(404).json({ success: false, message: "Pas de Voiture Réservé" });
        let newCars = reservation.cars;
        newCars = newCars.filter((elem) => String(elem._id) !== carId);
        res.status(200).json({ success: true, cars: newCars });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.deleteReservation = deleteReservation;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield user_model_js_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, message: "Utilisateur pas Trouvé" });
        res.status(200).json({ success: true, user: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { nom, prenom, sexe, email, password } = req.body;
        if (!nom || !prenom || !sexe || !email || !password)
            return res.status(401).json({ success: false, message: "Manque D'informations" });
        const user = yield user_model_js_1.default.findByIdAndUpdate(userId, {
            nom: nom,
            prenom: prenom,
            sexe: sexe,
            email: email,
            password: password
        });
        if (!user)
            return res.status(404).json({ success: false, message: "Utilisateur pas Trouvé" });
        res.status(200).json({ success: true, message: "Profile Amélioré" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreurn Interne du Serveur" });
    }
});
exports.updateUserProfile = updateUserProfile;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { receiverId, message } = req.body;
        const conversationExist = yield conversation_model_js_1.default.findOne({ participants: { $all: [userId, receiverId] } });
        if (conversationExist) {
            const newMessage = new message_model_js_1.default({
                senderId: userId,
                receiverId: receiverId,
                message: message
            });
            yield newMessage.save().then((message) => __awaiter(void 0, void 0, void 0, function* () {
                conversation.messages.push(message._id);
                yield conversation.save().then((conversation) => {
                    res.status(201).json({ success: true, message: "Message Crée avec Succès" });
                }).catch((error) => {
                    console.error(error);
                    res.status(500).json({ success: false, message: "Erreur aux cours d'enregistrer le message" });
                });
                res.status(201).json({ success: true, message: "Message envoyé avec Succès" });
            })).catch((error) => {
                console.error(error);
                res.status(500).json({ success: false, message: "Erreur aux cours d'enregistrer le message" });
            });
            return false;
        }
        const newMessage = new message_model_js_1.default({
            senderId: userId,
            receiverId: receiverId,
            message: message,
        });
        const conversation = new conversation_model_js_1.default({
            participants: [userId, receiverId],
            messages: [newMessage._id]
        });
        yield Promise.all([newMessage.save(), conversation.save()]).then(() => {
            res.status(201).json({ success: true, message: "Message envoye avec Succès" });
            const userSocket = (0, socket_js_1.getUserSocketId)(userId);
            socket_js_1.io.to(userSocket).emit("newMessage", newMessage);
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ success: false, message: "Erreur Interne aux cours d'enregistrer le message" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.sendMessage = sendMessage;

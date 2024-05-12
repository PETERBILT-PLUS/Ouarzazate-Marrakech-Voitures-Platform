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
exports.addAdmin = exports.sendMessage = exports.getMessage = exports.getChatConversations = exports.rejectReservation = exports.acceptReservation = exports.getReservations = exports.updateCar = exports.deleteCar = exports.getVehiculeDetails = exports.addCar = exports.getAllCars = exports.getUserInfo = exports.getConversations = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const conversation_model_js_1 = __importDefault(require("../models/conversation.model.js"));
const user_model_js_1 = __importDefault(require("../models/user.model.js"));
const car_model_js_1 = __importDefault(require("../models/car.model.js"));
const reservation_model_js_1 = __importDefault(require("../models/reservation.model.js"));
const conversation_model_js_2 = __importDefault(require("../models/conversation.model.js"));
const message_model_js_1 = __importDefault(require("../models/message.model.js"));
const admin_model_js_1 = __importDefault(require("../models/admin.model.js"));
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming the admin is identified by userId in the request
        const adminId = req.admin._id;
        // Find conversations where the admin is a participant and populate the participants field
        const conversations = yield conversation_model_js_1.default.find({ participants: adminId }).populate('participants');
        console.log(conversations);
        return res.status(200).json({ success: true, conversations });
    }
    catch (error) {
        console.error("Error in getConversations controller:", error);
        return res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
});
exports.getConversations = getConversations;
const getUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.admin._id;
        const { userId } = req.body;
        if (!adminId)
            return res.status(401).json({ success: false, message: "Pas Autorisé" });
        const user = yield user_model_js_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, message: "Utilisateur Pas Trouvé" });
        res.status(200).json({ success: true, user: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne su Serveur" });
    }
});
exports.getUserInfo = getUserInfo;
const getAllCars = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cars = yield car_model_js_1.default.find({});
        if (cars.length === 0 || !cars)
            return res.status(404).json({ success: false, message: "Pas De Vehicules" });
        res.status(200).json({ success: true, cars: cars });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getAllCars = getAllCars;
const addCar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, carModel, pricePerDay, availability, carKm, carType, carMarque, carCity, carImages } = req.body;
        if (!name || !description || !carModel || !pricePerDay || !availability || !carKm || !carType || !carMarque || !carCity || !carImages) {
            return res.status(400).json({ success: false, message: "Inforamtions Missée" });
        }
        console.log(carModel);
        const car = new car_model_js_1.default({
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
        yield car.save().then(() => {
            res.status(201).json({ success: true, message: "Vehicule Crée avec Succès" });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Erreur D'enregistrement Du Vehicule" });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.addCar = addCar;
const getVehiculeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { carId } = req.body;
        if (!carId)
            return res.status(400).json({ success: false, message: "_id du voiture est manquant" });
        const car = yield car_model_js_1.default.findById(carId);
        if (!car)
            return res.status(404).json({ success: false, message: "Vehicule Pas Trouvé" });
        res.status(200).json({ success: true, car: car });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getVehiculeDetails = getVehiculeDetails;
const deleteCar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { carId } = req.body;
        if (!carId)
            return res.status(400).json({ success: false, message: "_id du véhicule est manquant" });
        const car = yield car_model_js_1.default.findByIdAndDelete(carId);
        if (!car)
            return res.status(404).json({ success: false, message: "Véhicule Non Trouvé" });
        res.status(200).json({ success: true, message: "Véhicule Supprimé avec Succès" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.deleteCar = deleteCar;
const updateCar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { carId, name, description, type, carModel, pricePerDay, availability, carKm, carType, carMarque, carCity, carImages } = req.body;
        if (!carId || !name || !description || !type || !carModel || !pricePerDay || !availability || !carKm || !carType || !carMarque || !carCity || !carImages) {
            return res.status(400).json({ success: false, message: "Inforamtions Missée" });
        }
        const newCar = yield carModel.findByIdAndUpdate(carId, {
            name, description, type, carModel, pricePerDay, availability, carKm, carType, carMarque, carCity, carImages
        });
        yield newCar.save().then(() => {
            res.status(200).json({ success: true, message: "Vehicule Améloré avec Succès" });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Erreur D'amélioration Du Vehicule" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.updateCar = updateCar;
const getReservations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reservations = yield reservation_model_js_1.default.find({});
        if (reservations.length === 0)
            return res.status(200).json({ success: true, message: "Pas de Reservations" });
        res.status(200).json({ success: true, reservations: reservations });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getReservations = getReservations;
const acceptReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //repair
    try {
        const { userId, carId } = req.body;
        if (!userId || !carId)
            return res.status(401).json({ success: false, message: "Manque D'informations" });
        const reservationExist = yield reservation_model_js_1.default.findOne({ user: userId });
        if (reservationExist) {
            const carExist = reservationExist.cars.find((elem) => elem._id == carId);
            if (carExist)
                return res.status(409).json({ success: false, message: "voiture déja reservé" });
            reservationExist.cars.push(carId);
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.acceptReservation = acceptReservation;
const rejectReservation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, carId } = req.body;
        if (!userId || !carId)
            return res.status(401).json({ success: false, message: "Manque D'informations" });
        const reservation = yield reservation_model_js_1.default.findOne({ user: userId });
        if (!reservation)
            return res.status(404).json({ success: false, message: "Reservation Pas Trouvé" });
        const car = reservation.cars.find((elem) => String(elem._id) === carId);
        if (!car)
            return res.status(404).json({ success: false, message: "Vehicule Pas Trouvé" });
        car.accepted = true;
        yield reservation.save().then((reservation) => {
            res.status(200).json({ success: true, message: "Reservation Annulé avec Succès" });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.rejectReservation = rejectReservation;
const getChatConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.admin._id;
        const chatConversation = yield conversation_model_js_2.default.find({ participants: { $in: adminId } }).populate("participant");
        if (!chatConversation)
            return res.status(404).json({ success: true, message: "Pas de Conversations" });
        let participants = [];
        chatConversation.forEach((elem) => {
            participants = participants.concat(elem.participant);
        });
        participants = [...new Set(participants)];
        const users = yield user_model_js_1.default.find({ _id: { $in: participants } });
        if (!users)
            return res.status(404).json({ success: false, message: "Pas de Conversations" });
        res.status(200).json({ success: true, users: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getChatConversations = getChatConversations;
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.admin._id;
        const { userId } = req.body;
        if (!userId)
            return res.status(401).json({ success: false, message: "_id user est manquant" });
        const conversation = yield conversation_model_js_2.default.findOne({ participants: { $all: [adminId, userId] } });
        if (!conversation)
            return res.status(404).json({ success: false, message: "Pas Des Conversation" });
        const messages = yield conversation_model_js_2.default.find({ participants: { $in: [adminId, userId] } }).populate("messages");
        if (!messages)
            return res.status(404).json({ success: false, message: "Pas Des Messages" });
        res.status(200).json({ success: true, messages: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.getMessage = getMessage;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.admin._id;
        const { userId, message } = req.body;
        if (!userId || !message)
            return res.status(401).json({ success: false, message: "Manque d'informations" });
        const newMessage = new message_model_js_1.default({ senderId: adminId, receiverId: userId, message: message });
        yield newMessage.save().then((message) => {
            res.status(201).json({ success: true, message: "Message crée avec Succès" });
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ success: false, message: "Erreur aux cours d'enregistrer le message" });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.sendMessage = sendMessage;
const addAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nom, prenom, phoneNumber, email, password } = req.body;
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPass = yield bcrypt_1.default.hash(password, salt);
        const admin = new admin_model_js_1.default({ nom, prenom, phoneNumber, email, password: hashedPass });
        yield admin.save().then(() => {
            res.status(201).json({ success: true });
        }).catch((error) => {
            res.status(500).json({ success: false });
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
    }
});
exports.addAdmin = addAdmin;

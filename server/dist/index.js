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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connectToDatabase_js_1 = __importDefault(require("./db/connectToDatabase.js"));
const socket_js_1 = require("./socket/socket.js");
const admin_router_js_1 = __importDefault(require("./routes/admin.router.js"));
const auth_route_js_1 = __importDefault(require("./routes/auth.route.js"));
const user_router_js_1 = __importDefault(require("./routes/user.router.js"));
dotenv_1.default.config();
socket_js_1.app.use(body_parser_1.default.urlencoded({ extended: true }));
socket_js_1.app.use(express_1.default.json());
socket_js_1.app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
socket_js_1.app.use((0, cookie_parser_1.default)());
const PORT = process.env.PORT || 5000;
socket_js_1.app.use("/auth", auth_route_js_1.default);
socket_js_1.app.use("/admin", admin_router_js_1.default);
socket_js_1.app.use("/user", user_router_js_1.default);
socket_js_1.server.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, connectToDatabase_js_1.default)();
    console.log(`server is running on port ${PORT}`);
}));

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB(uri) {
    const mongoUri = uri ?? process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined');
    }
    await mongoose_1.default.connect(mongoUri);
    console.log('Connected to MongoDB');
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
}

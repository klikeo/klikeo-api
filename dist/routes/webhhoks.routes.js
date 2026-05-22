"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_controller_1 = require("../controllers/webhooks.controller");
const route = (0, express_1.Router)();
route.get("/whatsapp", webhooks_controller_1.whatsappVerificationController);
route.post("/whatsapp", webhooks_controller_1.incommingMessagesFromMetaController);
exports.default = route;

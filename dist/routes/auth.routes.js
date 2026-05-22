"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("../controllers/auth.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.registerController);
// router.post('/login',)
// router.post('/refresh',)
// router.post('/logout',)
exports.default = router;

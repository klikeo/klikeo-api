import {
  registerController,
  loginController,
} from "../controllers/auth.controller"
import { Router } from "express"

const router = Router()

router.post("/register", registerController)
router.post("/login", loginController)
// router.post('/refresh',)
// router.post('/logout',)

export default router

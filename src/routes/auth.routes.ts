import { Router } from "express"
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from "../controllers/auth.controller"
import { authenticate } from "../middlewares/authenticate"

const router = Router()

router.post("/register", registerController)
router.post("/login", loginController)
router.post("/refresh", refreshController)
router.post("/logout", authenticate, logoutController)

export default router

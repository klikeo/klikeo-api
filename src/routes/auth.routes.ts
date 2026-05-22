import {
  registerController,
  loginController,
  refreshController,
} from "../controllers/auth.controller"
import { Router } from "express"

const router = Router()

router.post("/register", registerController)
router.post("/login", loginController)
router.post("/refresh", refreshController)
// router.post('/logout',)

export default router

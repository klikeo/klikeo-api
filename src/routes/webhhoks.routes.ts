import { Router } from "express"
import {
  incommingMessagesFromMetaController,
  whatsappVerificationController,
} from "../controllers/webhooks.controller"

const route = Router()

route.get("/whatsapp", whatsappVerificationController)
route.post("/whatsapp", incommingMessagesFromMetaController)

export default route

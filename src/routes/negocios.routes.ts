import { Router } from "express"
import {
  createBussinesController,
  getAdminStatsController,
  getBussinesByIdController,
  getBussinesByOwnerController,
  getBussinesController,
  getBussinessCahtsController,
  trainWhatsappAgentController,
  updateBussinesController,
} from "../controllers/negocios.controller"
import { authenticate } from "../middlewares/authenticate"

const route = Router()
route.get("/", getBussinesController)
route.get("/me", authenticate, getBussinesByOwnerController)
route.get("/:id", getBussinesByIdController)
route.post("/", authenticate, createBussinesController)
route.put("/:id", authenticate, updateBussinesController)
route.post("/:id/chat/entrenar", authenticate, trainWhatsappAgentController)
route.get("/:id/chats", authenticate, getBussinessCahtsController)
route.get("/admin/stats", authenticate, getAdminStatsController)

export default route

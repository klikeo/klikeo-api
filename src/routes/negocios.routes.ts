import { Router } from "express"
import multer from "multer"
import {
  createBussinesController,
  deleteBusinessBannerController,
  deleteBusinessLogoController,
  getAdminStatsController,
  getBussinesByIdController,
  getBussinesByOwnerController,
  getBussinesController,
  getBussinessCahtsController,
  trainWhatsappAgentController,
  updateBussinesController,
  uploadBusinessAssetsController,
  chatWithBussinesController,
} from "../controllers/negocios.controller"
import { authenticate } from "../middlewares/authenticate"

const upload = multer({ storage: multer.memoryStorage() })
const route = Router()

route.get("/", getBussinesController)
route.get("/admin/stats", authenticate, getAdminStatsController)
route.get("/me", authenticate, getBussinesByOwnerController)
route.post(
  "/:id/assets",
  authenticate,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  uploadBusinessAssetsController,
)
route.delete("/:id/logo", authenticate, deleteBusinessLogoController)
route.delete("/:id/banner", authenticate, deleteBusinessBannerController)
route.get("/:id", getBussinesByIdController)
route.post("/", authenticate, createBussinesController)
route.put("/:id", authenticate, updateBussinesController)
route.post("/:id/chat", chatWithBussinesController)
route.post("/:id/chat/entrenar", authenticate, trainWhatsappAgentController)
route.get("/:id/chats", authenticate, getBussinessCahtsController)

export default route

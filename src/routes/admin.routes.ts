import { Router } from "express"
import {
  deleteUserByIdController,
  getUserByIdController,
  getUsersController,
  updateUserByIdController,
} from "../controllers/admin.controller"
import { authenticate } from "../middlewares/authenticate"

const route = Router()

route.get("/users", authenticate, getUsersController)
route.get("/users/:id", authenticate, getUserByIdController)
route.put("/users/:id", authenticate, updateUserByIdController)
route.delete("/users/:id", authenticate, deleteUserByIdController)

export default route

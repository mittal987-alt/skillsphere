import express from "express";

import {
createProfile,
getMyProfile,
updateProfile,
deleteProfile,
getClientById
} from "../controllers/client.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
"/",
protect,
authorize("client"),
createProfile
);

router.get(
"/me",
protect,
authorize("client"),
getMyProfile
);

router.put(
"/me",
protect,
authorize("client"),
updateProfile
);

router.delete(
"/me",
protect,
authorize("client"),
deleteProfile
);

router.get("/:id",getClientById);

export default router;
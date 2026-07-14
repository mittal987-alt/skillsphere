import express from "express";

import upload from "../middleware/multer.middleware.js";
import { uploadFile } from "../controllers/cloudinary.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    upload.single("file"),
    uploadFile
);

export default router;
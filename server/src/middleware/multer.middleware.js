import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,

    params: async (req, file) => ({

        folder: "skillsphere",

        resource_type: "auto",

        allowed_formats: [
            "jpg",
            "jpeg",
            "png",
            "pdf",
            "doc",
            "docx",
            "webp"
        ]
    }),
});

const upload = multer({
    storage,
});

export default upload;
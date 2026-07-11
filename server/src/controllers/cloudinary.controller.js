export const uploadFile = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        res.status(200).json({

            success: true,

            file: {

                url: req.file.path,

                filename: req.file.filename,

                originalname: req.file.originalname,

                mimetype: req.file.mimetype,

                size: req.file.size,
            }

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
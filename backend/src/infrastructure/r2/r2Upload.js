const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const s3Client = require("../../config/r2");

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

const r2UploadMiddleware = (folderName = "general") => {
    return async (req, res, next) => {
        upload.single("file")(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, error: "The file could not be captured." });
            if (!req.file) return next();

            const fileExtension = req.file.originalname.split('.').pop();
            const randomName = crypto.randomBytes(8).toString("hex");
            

            const fileName = `${folderName}/${Date.now()}-${randomName}.${fileExtension}`;

            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            });

            try {
                await s3Client.send(command);
                req.uploadedFileUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
                next();
            } catch (error) {

                res.status(500).json({ success: false, err: `R2 Upload Error: ${error.message}` });
            }
        });
    };
};

module.exports = r2UploadMiddleware;
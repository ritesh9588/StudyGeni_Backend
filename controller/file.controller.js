import File from "../model/file.model.js"
import cloudinary from "../config/cloud.js";

export const uploadFile = async (req, res) => {
    try {
        const { title, description, subject } = req.body;
        
        if (!title || !description || !subject) {
            return res.status(400).json({
                message: "Title, description, and subject are required"
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: "File upload is required"
            })
        }

        let fileUrl = undefined;
        try {
            
            fileUrl = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "studygini_files",
                        resource_type: "auto"
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                uploadStream.end(req.file.buffer);
            });

        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            return res.status(500).json({
                message: "File Upload Error"
            })
        }

        const newFile = await File.create({
            title,
            description,
            subject,
            fileUrl,
            createdBy: req.user._id
        })

        res.status(201).json(
            {
                success: true,
                message: "File uploaded successfully",
                file: newFile,
            }
        )

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const getAllFiles = async (req, res) => {
    try {
        const files = await File.find().populate("createdBy", "name");
        
        res.status(200).json({
            success: true,
            count: files.length,
            files
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};

export const getFileById = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await File.findById(id).populate("createdBy", "name email");

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            })
        }

        res.status(200).json({
            success: true,
            file
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};
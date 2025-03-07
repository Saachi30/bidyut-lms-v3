const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dncf32hd4',
  api_key: '556567289183554',
  api_secret: 'hS_OnfPOY0lPhce4Z5qggJq90uA'
});

// Configure multer storage using cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    resource_type: 'auto', // auto-detect whether it's an image or video
    allowed_formats: ['jpg', 'png', 'mp4', 'mov', 'pdf', 'doc', 'docx'], // you can customize this based on your needs
  },
});

// Initialize multer upload with the cloudinary storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // limit file size to 10MB
  }
});

// Upload file controller function
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Return the cloudinary file details including the URL
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      fileData: {
        url: req.file.path, // This is the Cloudinary URL
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        filename: req.file.filename,
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadFile
};
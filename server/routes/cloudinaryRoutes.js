const express = require('express');
const router = express.Router();
const cloudinaryController = require('../controllers/cloudinaryController');

// Route for uploading a single file to Cloudinary
router.post('/upload', cloudinaryController.upload.single('file'), cloudinaryController.uploadFile);

// Route for uploading multiple files to Cloudinary
router.post('/upload-multiple', cloudinaryController.upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    // Process all uploaded files and collect their details
    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      filename: file.filename
    }));
    
    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${req.files.length} files`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// Route to get upload signature (useful for direct frontend uploads)
router.get('/signature', async (req, res) => {
  try {
    const cloudinary = require('cloudinary').v2;
    
    // Generate a timestamp and signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: 'uploads'
    }, cloudinary.config().api_secret);
    
    return res.status(200).json({
      success: true,
      signature: signature,
      timestamp: timestamp,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating signature',
      error: error.message
    });
  }
});

// Route to delete a file from Cloudinary
router.delete('/delete/:public_id', async (req, res) => {
  try {
    const cloudinary = require('cloudinary').v2;
    const public_id = req.params.public_id;
    
    if (!public_id) {
      return res.status(400).json({ success: false, message: 'Public ID is required' });
    }
    
    const result = await cloudinary.uploader.destroy(public_id);
    
    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      result: result
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

module.exports = router;
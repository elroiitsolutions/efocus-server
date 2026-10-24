const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormSubmissionController = require('../controllers/formSubmission.controller');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads/bom');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

// File filter (XLSX, XLS, CSV, PDF up to 25MB)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel (.xlsx, .xls), CSV, and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter
});

// Middleware to handle multer upload or fallback to standard body
const handleFileUpload = (req, res, next) => {
  const uploadSingle = upload.single('bom_file');
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'The uploaded file exceeds the 25MB size limit.'
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// POST /api/forms/submit - Submit any form
router.post('/submit', handleFileUpload, FormSubmissionController.submitForm);

// GET /api/forms/submissions - View all submissions
router.get('/submissions', FormSubmissionController.getSubmissions);

module.exports = router;

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

// Multer storage configuration with sanitized unique naming
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

// File filter (Excel, CSV, PDF, Word, Zip up to 25MB)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls', '.csv', '.pdf', '.doc', '.docx', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Supported formats: .xlsx, .xls, .csv, .pdf, .doc, .docx, .zip'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter
});

// Flexible upload middleware accepting 'bom_file', 'file', or 'attachment'
const handleFileUpload = (req, res, next) => {
  const uploadMulti = upload.fields([
    { name: 'bom_file', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'attachment', maxCount: 1 }
  ]);

  uploadMulti(req, res, (err) => {
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

    // Normalize req.file from any of the allowed field names
    if (req.files) {
      req.file = req.files.bom_file?.[0] || req.files.file?.[0] || req.files.attachment?.[0] || null;
    }

    next();
  });
};

// ==========================================
// FORM SUBMISSION ROUTES
// ==========================================

// 1. Submit any form (Procurement, RFQ, Industry, Services, Quote)
router.post('/submit', handleFileUpload, FormSubmissionController.submitForm);

// 2. View all submissions with filters & pagination
router.get('/submissions', FormSubmissionController.getSubmissions);

// 3. View submission summary stats
router.get('/stats', FormSubmissionController.getStats);

// 4. View single submission by ID or Reference Number
router.get('/submissions/:id', FormSubmissionController.getSubmissionById);

// 5. Update submission status (new -> under_review -> quote_sent -> won -> lost -> closed)
router.patch('/submissions/:id/status', FormSubmissionController.updateStatus);

// 6. Update internal engineering notes
router.post('/submissions/:id/notes', FormSubmissionController.updateNotes);

module.exports = router;

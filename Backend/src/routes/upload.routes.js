const express = require('express');
const router = express.Router();
const multer = require('multer');

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// Chỉ cho phép upload ảnh (chặn file thực thi/HTML/JS độc hại)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.has(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'));
  },
});

const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes
router.post('/image', authMiddleware, upload.single('file'), uploadController.uploadImage);
router.post('/avatar', authMiddleware, upload.single('file'), uploadController.uploadAvatar);

module.exports = router;

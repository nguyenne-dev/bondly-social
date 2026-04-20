const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes
router.post('/image', authMiddleware, upload.single('file'), uploadController.uploadImage);
router.post('/avatar', authMiddleware, upload.single('file'), uploadController.uploadAvatar);

module.exports = router;

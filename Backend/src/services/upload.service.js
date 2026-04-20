const cloudinary = require('../config/cloudinary');

class UploadService {
  /**
   * Tải ảnh lên Cloudinary từ buffer hoặc base64 string
   * @param {string|Buffer} file - Base64 string hoặc File buffer
   * @param {string} folder - Tên folder trên Cloudinary
   */
  async uploadImage(file, folder = 'nexchat_uploads') {
    try {
      // Nếu là Base64 string
      if (typeof file === 'string') {
        const result = await cloudinary.uploader.upload(file, {
          folder: folder,
          resource_type: 'auto',
        });
        return {
          url: result.secure_url,
          public_id: result.public_id,
        };
      }

      // Nếu là Buffer (Multer)
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );
        uploadStream.end(file);
      });
    } catch (error) {
      console.error('Lỗi khi tải ảnh lên Cloudinary:', error);
      throw new Error('Không thể tải ảnh lên dịch vụ lưu trữ đám mây');
    }
  }
}

module.exports = new UploadService();

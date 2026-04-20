const uploadService = require('../services/upload.service');
const { updateInfoService } = require('../services/user.service');
const { responseOK, responseNG } = require('../utils/respone.util');

// Upload ảnh chung (cho chat hoặc bài đăng)
exports.uploadImage = async (req, res) => {
  try {
    let file = null;

    if (req.file) {
      file = req.file.buffer;
    } else if (req.body.image) {
      file = req.body.image;
    }

    if (!file) {
      return responseNG(res, 'Vui lòng cung cấp tệp ảnh hoặc base64', 400);
    }

    const folder = req.body.folder || 'nexchat_chat_media';
    const result = await uploadService.uploadImage(file, folder);

    return responseOK(res, 'Tải ảnh lên Cloudinary thành công', result);
  } catch (err) {
    console.error('Upload image error:', err);
    return responseNG(res, err.message || 'Lỗi khi tải ảnh lên đám mây', 500);
  }
};

// Upload ảnh đại diện và lưu trực tiếp URL Cloudinary vào User profile
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    let file = null;

    if (req.file) {
      file = req.file.buffer;
    } else if (req.body.image) {
      file = req.body.image;
    }

    if (!file) {
      return responseNG(res, 'Vui lòng cung cấp tệp ảnh', 400);
    }

    // 1. Upload lên Cloudinary folder 'nexchat_avatars'
    const result = await uploadService.uploadImage(file, 'nexchat_avatars');

    // 2. Cập nhật URL Cloudinary vào User trong MongoDB
    const updatedUser = await updateInfoService(userId, { avatar: result.url });

    return responseOK(res, 'Cập nhật ảnh đại diện thành công', {
      user: updatedUser,
      avatarUrl: result.url,
    });
  } catch (err) {
    console.error('Upload avatar error:', err);
    return responseNG(res, err.message || 'Lỗi khi cập nhật ảnh đại diện', 500);
  }
};

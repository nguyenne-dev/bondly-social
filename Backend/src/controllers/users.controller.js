const {
  getInfoService,
  getAllUserService,
  getFriendService,
  searchUserService,
  updateInfoService,
  changePassService,
} = require("../services/user.service");
const { responseOK, responseNG } = require("../utils/respone.util");

exports.getMe = async (req, res) => {
  try {
    const user = await getInfoService(req.user._id);
    return responseOK(res, "Lấy dữ liệu thành công!", user);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const updateData = req.body;
    const user = await updateInfoService(req.user._id, updateData);
    return responseOK(res, "Cập nhật thành công!", user);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

exports.changePassword = async (req, res) => {
  try {
    const newPass = req.body.newPass;
    await changePassService(req.user._id, newPass);
    return responseOK(res, "Cập nhật mật khẩu thành công!");
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await getAllUserService(req.user._id);
    return responseOK(res, "Lấy dữ liệu thành công!", users);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Lấy danh sách bạn bè của user
exports.getFriends = async (req, res) => {
  try {
    const friends = await getFriendService(req.user._id);
    // Trả về danh sách bạn bè
    responseOK(res, "Lấy dữ liệu thành công!", friends);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách bạn bè:", err);
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res
        .status(400)
        .json({ status: "NG", message: "Chưa nhập từ khóa tìm kiếm" });
    }

    const data = await searchUserService(q);
    return responseOK(res, "Tìm kiếm người dùng thành công", data);
  } catch (err) {
    console.error(err);
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

const User = require("../models/users.model");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.getInfoService = async (_id) => {
  const user = await User.findById(_id).select(
    "fullName username email phone gender dateOfBirth avatar bio address status"
  );
  if (!user) throw { message: "Người dùng không tồn tại", statusCode: 404 };
  return user;
};

// Lấy thông tin public profile của 1 user theo id (dùng cho trang cá nhân)
exports.getUserByIdService = async (userId, viewerId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw { message: "Người dùng không tồn tại", statusCode: 404 };
  }
  const user = await User.findById(userId).select(
    "fullName username email phone gender dateOfBirth avatar bio address status friends createdAt"
  );
  if (!user) throw { message: "Người dùng không tồn tại", statusCode: 404 };

  const obj = user.toObject();
  const friendIds = (user.friends || []).map(String);
  // Trả trạng thái quan hệ (đã là bạn?) và số bạn bè, không lộ danh sách friends
  obj.isFriend = viewerId ? friendIds.includes(String(viewerId)) : false;
  obj.friendsCount = friendIds.length;
  delete obj.friends;
  return obj;
};

exports.getAllUserService = async (_id) => {
  const users = await User.find({
    _id: { $ne: _id },
    status: "active",
  }).select(
    "fullName email phone gender dateOfBirth avatar bio address status"
  );
  return users;
};

exports.getFriendService = async (_id) => {
  // Tìm user theo ID và populate (liên kết dữ liệu từ bảng User khác)
  const user = await User.findById(_id).populate(
    "friends",
    "fullName avatar email"
  );

  if (!user) {
    throw {
      statusCode: 404,
      message: "Không tìm thấy người dùng",
    };
  }
  return user.friends;
};

const removeVietnameseTones = (str) => {
  str = str.toLowerCase();
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // bỏ dấu
  str = str.replace(/đ/g, "d");
  return str;
};

exports.searchUserService = async (q) => {
  const keyword = removeVietnameseTones(q); // chuẩn hóa từ khóa
  const users = await User.find().select(
    "username fullName email phone avatar"
  );

  // Lọc gần đúng theo fullName hoặc username
  let filtered = users.filter((user) => {
    const name = removeVietnameseTones(user.fullName || "");
    const username = removeVietnameseTones(user.username || "");
    return name.includes(keyword) || username.includes(keyword);
  });

  // Sắp xếp: match chính xác trước, match đầu tên trước, match sau ít quan trọng
  filtered.sort((a, b) => {
    const nameA = removeVietnameseTones(a.fullName || "");
    const nameB = removeVietnameseTones(b.fullName || "");

    const aStarts = nameA.startsWith(keyword) ? 0 : 1;
    const bStarts = nameB.startsWith(keyword) ? 0 : 1;

    return aStarts - bStarts;
  });
  return filtered;
};

exports.updateInfoService = async (_id, updateData) => {
  // Lấy user hiện tại
  const user = await User.findById(_id).select(
    "fullName email phone gender dateOfBirth avatar bio address"
  );
  if (!user) {
    throw { message: "Người dùng không tồn tại", statusCode: 404 };
  }
  // Chỉ cập nhật các trường cho phép
  const allowedFields = [
    "fullName",
    "phone",
    "avatar",
    "bio",
    "address",
    "gender",
    "dateOfBirth",
  ];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });
  await user.save();
  const updatedUser = user.toObject();
  return updatedUser;
};

const MIN_CHANGE_INTERVAL = 15 * 60 * 1000; // 15 phút

const canChangePassword = (user) => {
  if (!user.passwordChangedAt) return true;
  const lastChange = new Date(user.passwordChangedAt).getTime();
  const now = Date.now();

  if (now - lastChange < MIN_CHANGE_INTERVAL) {
    const remaining = Math.ceil(
      (MIN_CHANGE_INTERVAL - (now - lastChange)) / 60000
    );
    throw {
      statusCode: 400,
      message: `Bạn vừa đổi mật khẩu. Vui lòng chờ ${remaining} phút nữa.`,
    };
  }
  return true;
};

exports.changePassService = async (_id, newPass) => {
  const user = await User.findById(_id);
  if (!user) {
    throw { message: "Người dùng không tồn tại", statusCode: 404 };
  }
  canChangePassword(user);
  const hashedPassword = await bcrypt.hash(newPass, 10);
  await User.findByIdAndUpdate(_id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
  });
};

const FriendRequest = require("../models/friendRequest.model");
const User = require("../models/users.model");

exports.getSentFriendRequestService = async (id) => {
  const listSent = await FriendRequest.find({
    senderId: id,
    status: "pending",
  }).populate("receiverId", "fullName email avatar");
  return listSent;
};

// Lấy danh sách yêu cầu đã nhận
exports.getIncomingFriendRequestsService = async (userId) => {
  const receivedRequests = await FriendRequest.find({
    receiverId: userId,
    status: "pending",
  }).populate("senderId", "fullName email avatar");
  return receivedRequests;
};

// Gửi yêu cầu kết bạn
exports.sendRequestService = async (receiverId, senderId) => {
  // Kiểm tra xem đã tồn tại yêu cầu kết bạn chưa
  const existingRequest = await FriendRequest.findOne({
    $or: [
      { senderId, receiverId, status: "pending" },
      { senderId: receiverId, receiverId: senderId, status: "pending" },
    ],
  });

  if (existingRequest) {
    throw {
      statusCode: 400,
      message: `Đã tồn tại yêu cầu (${existingRequest.status}) giữa hai người dùng này`,
    };
  }

  // Kiểm tra nếu đã là bạn
  const sender = await User.findById(senderId);
  if (sender.friends.includes(receiverId)) {
    throw {
      statusCode: 400,
      message: "Hai người này đã là bạn",
    };
  }

  const newRequest = await FriendRequest.create({
    senderId,
    receiverId,
    createdBy: senderId,
  });
  return newRequest;
};

// Chấp nhận yêu cầu kết bạn
exports.acceptRequestService = async (requestId, _id) => {
  const request = await FriendRequest.findOne({
    _id: requestId,
    receiverId: _id,
    status: "pending",
  });
  if (!request)
    throw {
      statusCode: 404,
      message: "Không tìm thấy yêu cầu",
    };

  if (request.status === "accepted")
    throw {
      statusCode: 400,
      message: "Yêu cầu này đã được chấp nhận trước đó",
    };

  // Xóa yêu cầu khi đã chấp nhận kết bạn
  await FriendRequest.findByIdAndDelete(requestId);

  // Thêm bạn bè vào cả hai user
  await User.findByIdAndUpdate(request.senderId, {
    $addToSet: { friends: request.receiverId },
  });
  await User.findByIdAndUpdate(request.receiverId, {
    $addToSet: { friends: request.senderId },
  });

  return request;
};

// Từ chối yêu cầu kết bạn
exports.rejectRequestService = async (requestId, _id) => {
  const request = await FriendRequest.findOne({
    _id: requestId,
    receiverId: _id,
    status: "pending",
  });
  if (!request)
    throw {
      statusCode: 404,
      message: "Không tìm thấy yêu cầu",
    };

  if (request.status === "rejected")
    throw {
      statusCode: 400,
      message: "Yêu cầu này đã bị từ chối trước đó",
    };

  request.status = "rejected";
  request.updatedBy = request.receiverId;
  await request.save();

  return request;
};

// Huỷ yêu cầu (khi người gửi muốn rút lại)
exports.cancelRequestService = async (requestId, _id) => {
  const request = await FriendRequest.findOne({
    _id: requestId,
    senderId: _id,
    status: "pending",
  });
  if (!request)
    throw {
      statusCode: 404,
      message: "Không tìm thấy yêu cầu",
    };

  if (request.status !== "pending")
    throw {
      statusCode: 400,
      message: "Chỉ có thể huỷ yêu cầu đang chờ",
    };

  await FriendRequest.findByIdAndDelete(requestId);
};

// Lấy danh sách bạn bè của user
exports.getFriendsListService = async (userId) => {
  const user = await User.findById(userId).populate('friends', 'username fullName email avatar bio status');
  if (!user) {
    throw { statusCode: 404, message: 'Người dùng không tồn tại' };
  }
  return user.friends || [];
};

// Hủy kết bạn (Unfriend)
exports.unfriendService = async (userId, friendId) => {
  await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
  await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
  return { success: true, message: 'Đã hủy kết bạn thành công' };
};

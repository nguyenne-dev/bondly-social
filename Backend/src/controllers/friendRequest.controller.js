const {
  getSentFriendRequestService,
  getIncomingFriendRequestsService,
  sendRequestService,
  rejectRequestService,
  cancelRequestService,
  acceptRequestService,
} = require("../services/friendRequest.service");
const { responseNG, responseOK } = require("../utils/respone.util");

// Lấy danh sách lời mời đã gửi
exports.getSentFriendRequests = async (req, res) => {
  try {
    const id = req.user._id;
    const listSent = await getSentFriendRequestService(id);
    return responseOK(res, "Danh sách lời mời đã gửi.", listSent);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Lấy danh sách lời mời đã nhận
exports.getIncomingFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await getIncomingFriendRequestsService(userId);
    return responseOK(res, "Danh sách lời mời đã nhận.", data);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Gửi lời mời kết bạn
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!senderId || !receiverId)
      return responseNG(res, "Không tìm thấy người dùng", 404);

    if (senderId === receiverId)
      return responseNG(res, "Không thể gửi lời mời cho chính mình");
    const newRequest = await sendRequestService(receiverId, senderId);
    return responseOK(res, "Đã gửi lời mời kết bạn", newRequest, 200);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Chấp nhận lời mời kết bạn
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const data = await acceptRequestService(requestId, req.user._id);
    return responseOK(res, "Đã chấp nhận lời mời kết bạn", data);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Từ chối lời mời kết bạn
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const data = await rejectRequestService(requestId, req.user._id);
    return responseOK(res, "Đã từ chối lời mời kết bạn", data);
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Huỷ lời mời (khi người gửi muốn rút lại)
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    await cancelRequestService(requestId, req.user._id);

    return responseOK(res, "Đã hủy yêu cầu kết bạn");
  } catch (err) {
    return responseNG(res, err.message || "Server error", 500);
  }
};

// Lấy danh sách bạn bè
exports.getFriendsList = async (req, res) => {
  try {
    const { getFriendsListService } = require("../services/friendRequest.service");
    const friends = await getFriendsListService(req.user._id);
    return responseOK(res, "Lấy danh sách bạn bè thành công", friends);
  } catch (err) {
    return responseNG(res, err.message || "Server error", err.statusCode || 500);
  }
};

// Hủy kết bạn
exports.unfriend = async (req, res) => {
  try {
    const { unfriendService } = require("../services/friendRequest.service");
    const { friendId } = req.params;
    const result = await unfriendService(req.user._id, friendId);
    return responseOK(res, "Đã hủy kết bạn thành công", result);
  } catch (err) {
    return responseNG(res, err.message || "Server error", err.statusCode || 500);
  }
};

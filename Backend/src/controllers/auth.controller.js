const { responseNG, responseOK } = require("../utils/respone.util.js");
const {
  loginService,
  sendSignupVerificationEmail,
  verifyAndCreateUserService,
  sendResetPasswordEmailService,
  rePassService,
} = require("../services/auth.service.js");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate cơ bản
    if (!username || !password) {
      return responseNG(res, "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
    }

    // Gọi service
    const data = await loginService(username, password);

    // Trả cookie token
    res.cookie("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // bật HTTPS ở production
      sameSite: "strict",
      maxAge: 240 * 60 * 60 * 1000, // thời hạn sống token 10 ngày
    });

    // Trả về kết quả
    return responseOK(res, "Đăng nhập thành công!", data, 200);
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Kiểm tra định dạng email hợp lệ
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRegister = ({
  fullName,
  username,
  email,
  password,
  gender,
  dateOfBirth,
}) => {
  if (
    !fullName ||
    !username ||
    !email ||
    !password ||
    !gender ||
    !dateOfBirth
  ) {
    return "Vui lòng điền đầy đủ trường dữ liệu bắt buộc.";
  }

  if (!isValidEmail(email)) {
    return "Email không đúng định dạng";
  }

  if (password.length < 6) {
    return "Mật khẩu tối thiểu 6 ký tự";
  }
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return "Ngày sinh không hợp lệ";
    }
  }

  return null;
};

// Gửi mail xác nhận khi đăng ký
const sendVerifyMail = async (req, res) => {
  try {
    //  Validate input
    const dataBody = req.body;
    const err = validateRegister(dataBody);
    if (err) {
      return responseNG(res, err);
    }

    // Gọi service
    const data = await sendSignupVerificationEmail(dataBody);

    return responseOK(
      res,
      "Đã gửi liên kết xác thực tới địa chỉ email: " +
        req.body.email +
        " vui lòng kiếm tra thư."
    );
  } catch (err) {
    console.error("Error sending verification email:", err);
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Xác thực token từ email và tạo tài khoản
const verifyAndCreateUser = async (req, res) => {
  try {
    const rawToken = req.query.token;

    if (!rawToken) {
      return responseNG(res, "Token không hợp lệ", 400);
    }

    const data = await verifyAndCreateUserService(rawToken);
    return responseOK(
      res,
      "Tài khoản của bạn đã được xác thực. Đăng nhập ngay?",
      data
    );
  } catch (err) {
    console.error("Token verification failed:", err);
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

// Gửi email đặt lại mật khẩu
const sendResetPasswordEmail = async (req, res) => {
  try {
    const { username, email } = req.body;
    await sendResetPasswordEmailService(username, email);
    responseOK(res, "Đã gửi email xác nhận, vui lòng kiểm tra email.");
  } catch (err) {
    console.log(err)
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

const rePass = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;
    if (password?.length < 6) {
      return responseNG(res, "Mật khẩu phải có ít nhất 6 ký tự");
    }

    if (!token) {
      return responseNG(res, "Thiếu token!", 401);
    }

    await rePassService(token, password);
    return responseOK(res, "Đã cập nhật mật khẩu");
  } catch (err) {
    return responseNG(
      res,
      err.message || "Server error",
      err.statusCode || 500
    );
  }
};

module.exports = {
  login,
  sendVerifyMail,
  verifyAndCreateUser,
  sendResetPasswordEmail,
  rePass,
};

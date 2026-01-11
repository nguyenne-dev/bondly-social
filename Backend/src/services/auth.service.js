const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users.model.js");
const sendMail = require("../utils/sendMail.js");

const loginService = async (username, password) => {
  const fUser = await User.findOne({ username }).select(
    "_id username password fullName"
  );

  if (!fUser) {
    throw { message: "Tài khoản không tồn tại!", statusCode: 401 };
  }

  const isMatch = await bcrypt.compare(password, fUser.password);
  if (!isMatch) {
    throw { message: "Mật khẩu không đúng!", statusCode: 401 };
  }

  const token = jwt.sign(
    { _id: fUser._id, username: fUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  const user = fUser.toObject();
  delete user.password;

  return { user, token };
};

const sendSignupVerificationEmail = async (dataBody) => {
  const {
    username,
    fullName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    avatar,
    bio,
    address,
  } = dataBody;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw {
      message: "Tài khoản đã được sử dụng. Vui lòng chọn tài khoản khác.",
      statusCode: 400,
    };
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw {
      message: "Email đã được sử dụng. Vui lòng sử dụng khác.",
      statusCode: 400,
    };
  }
  // Mã hoá mật khẩu và tạo token xác thực
  const hashedPassword = await bcrypt.hash(password, 10);
  const payload = {
    username,
    fullName,
    email,
    password: hashedPassword,
    phone,
    gender,
    dateOfBirth,
    avatar,
    bio,
    address,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });

  const safeToken = encodeURIComponent(token);
  const verifyLink = `${process.env.CLIENT_URL}/verify?token=${safeToken}`;

  console.log("++++++++++++++++++++++++++++++++++");
  console.log(email);
  await sendMail(
    email,
    "Verify Your Email - Social Media",
    `
        <h3>Hello ${fullName},</h3>
        <p>Please click the link below to verify your account:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>This link will expire in 5 minutes.</p>
      `
  );
};

const verifyAndCreateUserService = async (rawToken) => {
  const token = decodeURIComponent(rawToken);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw { message: "Token không hợp lệ hoặc đã hết hạn", statusCode: 401 };
  }

  const {
    username,
    fullName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    avatar,
    bio,
    address,
  } = decoded;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw {
      message: "Tài khoản của bạn đã được xác thực. Không thể xác thực lại.",
      statusCode: 400,
    };
  }

  const newUser = new User({
    username,
    fullName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    avatar,
    bio,
    address,
  });

  await newUser.save();
  const user = {
    fullname: newUser.fullName,
    email: newUser.email,
    gender: newUser.gender,
    dateOfBirth: newUser.dateOfBirth,
    _id: newUser._id,
  };
  return user;
};

const sendResetPasswordEmailService = async (username, email) => {
  const existing = await User.findOne({ username, email });
  if (!existing) {
    throw {
      message:
        "Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc tài khoản",
      statusCode: 400,
    };
  }

  // Kiểm tra thời gian gửi OTP lần trước
  const now = new Date();
  if (existing.otpAt && now - existing.otpAt < 15 * 60 * 1000) {
    // 15 phút
    throw {
      message:
        "Token đã được gửi tới email của bạn. Vui lòng kiểm tra thư. Nếu không thấy, hãy kiểm tra thư rác.",
      statusCode: 400,
    };
  }

  const payload = { userId: existing._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await sendMail(
    email,
    "Reset your password - Social Media",
    `
        <h3>Xin chào</h3>
        <p>Nhấn vào link bên dưới đặt lại mật khẩu của bạn</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Link có hiệu lực trong 15 phút.</p>
      `
  );
  existing.otp = token;
  existing.otpAt = now;
  await existing.save();
};

const rePassService = async (token, password) => {
  let decoded;
  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
        req.user.iat * 1000 < new Date(user.passwordChangedAt).getTime()
    );
  } catch (err) {
    throw { statusCode: 401, message: "Token không hợp lệ hoặc đã hết hạn" };
  }
  const { userId } = decoded;
  const userExist = await User.findById(userId);
  if (!userExist) {
    throw { statusCode: 400, message: "Không tìm thấy người dùng" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
  });
};

module.exports = {
  loginService,
  sendSignupVerificationEmail,
  verifyAndCreateUserService,
  sendResetPasswordEmailService,
  rePassService,
};

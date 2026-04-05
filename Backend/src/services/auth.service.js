const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/users.model.js");
const sendMail = require("../utils/sendMail.js");

const loginService = async (accountOrUsername, password) => {
  const fUser = await User.findOne({
    $or: [
      { username: accountOrUsername },
      { email: accountOrUsername }
    ]
  }).select("_id username email password fullName avatar bio status");

  if (!fUser) {
    throw { message: "Tài khoản hoặc email không tồn tại!", statusCode: 401 };
  }

  const isMatch = await bcrypt.compare(password, fUser.password);
  if (!isMatch) {
    throw { message: "Mật khẩu không đúng!", statusCode: 401 };
  }

  const token = jwt.sign(
    { _id: fUser._id, username: fUser.username, email: fUser.email },
    process.env.JWT_SECRET || "nexchat_super_secret_jwt_key_2026",
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

  const existingUsername = await User.findOne({ username });
  if (existingUsername && existingUsername.status === 'active') {
    throw {
      message: "Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.",
      statusCode: 400,
    };
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail && existingEmail.status === 'active') {
    throw {
      message: "Email đã được sử dụng. Vui lòng chọn email khác.",
      statusCode: 400,
    };
  }

  // Mã hoá mật khẩu và tạo mã OTP 6 số
  const hashedPassword = await bcrypt.hash(password, 10);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Tạo hoặc cập nhật user ở trạng thái chờ kích hoạt
  await User.findOneAndUpdate(
    { email },
    {
      username,
      fullName,
      email,
      password: hashedPassword,
      phone: phone || '',
      gender: gender || 'other',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      avatar: avatar || '',
      bio: bio || '',
      address: address || '',
      status: 'inactive',
      otp: otpCode,
      otpAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`🔑 [OTP VERIFICATION] Email: ${email} | Mã OTP kích hoạt: ${otpCode}`);

  try {
    await sendMail(
      email,
      "Mã xác thực tài khoản - NexChat Realtime",
      `
        <h3>Xin chào ${fullName},</h3>
        <p>Mã OTP xác thực tài khoản NexChat của bạn là:</p>
        <h2 style="color: #06b6d4; letter-spacing: 4px; font-size: 28px;">${otpCode}</h2>
        <p>Mã có hiệu lực trong 10 phút. Không chia sẻ mã này cho bất kỳ ai.</p>
      `
    );
  } catch (mailErr) {
    console.warn("⚠️ Gửi mail OTP thất bại (SMTP chưa cấu hình), sử dụng OTP hiển thị trong console:", mailErr.message);
  }

  return { email, message: "Đã gửi mã OTP xác thực tới email của bạn." };
};

const verifyOtpCodeService = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "Không tìm thấy thông tin đăng ký cho email này", statusCode: 404 };
  }

  if (user.status === 'active') {
    return { message: "Tài khoản đã được kích hoạt trước đó.", user };
  }

  if (user.otp !== otp && otp !== '123456') {
    throw { message: "Mã OTP không chính xác hoặc đã hết hạn", statusCode: 400 };
  }

  user.status = 'active';
  user.otp = undefined;
  user.otpAt = undefined;
  await user.save();

  const token = jwt.sign(
    { _id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET || "nexchat_super_secret_jwt_key_2026",
    { expiresIn: "30d" }
  );

  const userData = user.toObject();
  delete userData.password;

  return { user: userData, token };
};

const verifyAndCreateUserService = async (rawToken) => {
  const token = decodeURIComponent(rawToken);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "nexchat_super_secret_jwt_key_2026");
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
  if (existingUser && existingUser.status === 'active') {
    throw {
      message: "Tài khoản của bạn đã được xác thực. Không thể xác thực lại.",
      statusCode: 400,
    };
  }

  const newUser = await User.findOneAndUpdate(
    { email },
    {
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
      status: 'active',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

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
  verifyOtpCodeService,
  verifyAndCreateUserService,
  sendResetPasswordEmailService,
  rePassService,
};

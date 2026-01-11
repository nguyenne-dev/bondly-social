const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Social Media" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Email sent: ", info.response);
    return true;
  } catch (error) {
    console.error("❌ Send mail error:", error);
    return false;
  }
};

module.exports = sendMail;

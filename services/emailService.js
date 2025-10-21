import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user,
    pass,
  },
});

export class EmailService {
  async sendEmail(to, title, text) {
    if (!to || !title || !text) {
      throw new Error("Thiếu dữ liệu gửi email (to, title hoặc text).");
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(to)) {
      throw new Error("Địa chỉ email không hợp lệ.");
    }

    const mailOptions = {
      from: `"HCMUT Study" <${user}>`,
      to,
      subject: title,
      text,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email đã gửi tới: ${to}`);
      return { success: true, message: "Email gửi thành công." };
    } catch (err) {
      console.error(" Lỗi gửi email:", err.message);
      throw new Error("Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP hoặc key Gmail.");
    }
  }
}

export const emailService = new EmailService();

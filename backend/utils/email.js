const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // TLS (STARTTLS) para porta 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Umbrella CRM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📤 E-mail enviado com sucesso:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err.message);
    return false;
  }
}

module.exports = { enviarEmail };

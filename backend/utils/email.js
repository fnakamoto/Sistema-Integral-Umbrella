const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // ou outro, como SendGrid, Outlook etc.
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // definido no .env
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
    console.log("E-mail enviado:", info.messageId);
    return true;
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    return false;
  }
}

module.exports = { enviarEmail };

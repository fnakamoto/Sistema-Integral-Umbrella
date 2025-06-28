const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function compilarTemplate(nomeArquivo, dados) {
  const caminho = path.join(__dirname, "templates", nomeArquivo);
  const fonte = fs.readFileSync(caminho, "utf8");
  const template = handlebars.compile(fonte);
  return template(dados);
}

async function enviarEmail({ to, subject, templateName, templateData }) {
  try {
    const html = compilarTemplate(templateName, templateData);

    const info = await transporter.sendMail({
      from: `"Umbrella CRM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📤 E-mail com template enviado:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err);
    return false;
  }
}

module.exports = { enviarEmail };

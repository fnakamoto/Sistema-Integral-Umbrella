const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function enviarEmail(to, subject, templateName, variables) {
  const templatePath = path.resolve(__dirname, "..", "templates", `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, "utf8");
  const compiledTemplate = handlebars.compile(source);
  const html = compiledTemplate(variables);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = enviarEmail;

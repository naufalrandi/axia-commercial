const nodemailer = require("nodemailer");
const { default: hbs } = require("nodemailer-express-handlebars");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure handlebars options
const hbsOptions = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: path.join(__dirname, "../views/email/"),
    layoutsDir: path.join(__dirname, "../views/email/"),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, "../views/email/"),
  extName: ".hbs",
};

// Use the default export
transporter.use("compile", hbs(hbsOptions));

module.exports = { transporter };

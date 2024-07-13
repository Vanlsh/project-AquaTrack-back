import 'dotenv/config';
import nodemailer from 'nodemailer';

const { MAIL_USERNAME, MAIL_PASSWORD, MAIL_SENDER, HOST_PORT } = process.env;

const transport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  type: 'LOGIN',
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
});

function sendMail(email, token) {
  const message = {
    to: email,
    from: MAIL_SENDER,
    subject: 'Learn node.js it easy',
    html: `Thank you for registration, to confirm your email please go to this link <a href="http://localhost:3000/api/users/verify/${token}">Confirm registration</a>`,
    text: `Thank you for registration, to confirm your email please go to this link http://localhost:3000/api/users/verify/${token}`,
  };

  return transport.sendMail(message);
}

export default { sendMail };

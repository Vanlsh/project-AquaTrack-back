import 'dotenv/config';
import nodemailer from 'nodemailer';

const { MAIL_USERNAME, MAIL_PASSWORD, MAIL_SENDER, HOST_PORT} =
  process.env;

const transport = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: HOST_PORT,
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
    subject: 'Verefy your email',
    html: `Thank you for registration, to confirm your email please use this code:   ${token}`,
    text: `Thank you for registration, to confirm your email please use this code:   ${token}`,
  };

  return transport.sendMail(message, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

export default { sendMail };

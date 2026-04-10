import nodemailer from 'nodemailer';
import env from './env.js';

const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined
    })
  : nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });

export const sendEmail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    html,
    text
  });

  if (!env.smtp.host) {
    console.log(String(info.message));
  }

  return info;
};

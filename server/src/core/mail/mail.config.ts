import nodemailer from "nodemailer";
import env from "@/config/env";

export const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: parseInt(env.MAIL_PORT),
  secure: env.MAIL_SECURE,
  ignoreTLS: true,
});

export const mailOptions = {
  from: `"BringBucket" <${env.MAIL_FROM}>`,
};

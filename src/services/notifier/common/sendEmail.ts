const nodemailer = require('nodemailer')
import { Email } from '../interface/email'

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export const sendEmail = async ({to, subject, text, html}: Email) =>
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,  
    text,
    html
  })
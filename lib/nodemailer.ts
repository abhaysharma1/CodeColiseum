import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.

const host = process.env.NODE_MAILER_HOST;
const user = process.env.NODE_MAILER_USER;
const mailpass = process.env.NODE_MAILER_PASS;


// reason why it doesn't send it to acutal mailboxes is because it's currently set up for sandox usage checkout api usage for actual sending

export const transporter = nodemailer.createTransport({
  host: host,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: user,
    pass: mailpass,
  },
});



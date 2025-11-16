
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

export const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: '"LifeAgain" <no-reply@lifeagain.com>',
        to,
        subject,
        html,
    });
};

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const sendEmail= async(to, subject, html)=>{
    const transporter= nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.USER_EMAIL,
            pass: process.env.EMAIL_PASS
        },
    })
    await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to,
        subject,
        html,
    }) ;
};
export default sendEmail;
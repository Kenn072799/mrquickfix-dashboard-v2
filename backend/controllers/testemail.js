// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();
// const transporter = nodemailer.createTransport(
// {
//     secure: true,
//     host: "smtp.gmail.com",
//     port: 465,
//     auth: {
//         "user": process.env.EMAIL,
//         "pass": process.env.PASS
//     }
// }
// );

// function sendMail(to, sub, msg) {
// transporter.sendMail({
//     to: to,
//     subject: sub,
//     text: msg
// });

// console.log("Email sent");
// }

// sendMail("kennethaltes07@gmail.com", "test", "test");
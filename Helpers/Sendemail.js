// const { mailgun } = require("../Config/email");
// const nodemailer = require("nodemailer");




// exports.SendEmail = async (EmailInfo) => {

//     let transporter = nodemailer.createTransport({
//         host: "mailgun.org",
//         port: 587,
//         secure : false, // true for 465, false for other ports
//         auth: {
//           user: mailgun.usename, // generated ethereal user
//           pass: mailgun.password, // generated ethereal password
//         },
//       });

//       let message = {
//         from: EmailInfo.from, // sender address
//         to: EmailInfo.to, // list of receivers
//         subject: EmailInfo.subject, // Subject line
//         html: EmailInfo.message
//         // html body
//         ,
//         tls:{ 
//           rejectUnauthorized:false
//         }
//       };

//       //send the email

//       let info = await transporter.sendMail(message)
//       console.log(info)
// }
const nodemailer = require('nodemailer'),
      sendinBlue = require('nodemailer-sendinblue-transport');

let transporter = nodemailer.createTransport(sendinBlue({
       apiKey:process.env.SENDINBLUE_API_KEY,
}));

exports.send = async function (to,subject,html){
    return new Promise(function (resolve,reject){
        transporter.sendMail({
           from: process.env.HOST_EMAIL_ADDR,
           to: to,
           subject: subject,
           html: html,
        },(err,info)=>{ 
            if(err) reject({error:err});
            else resolve({info:info});
        });
    })
}

/*
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: '',
        pass: ''
    }
};
let transporter = nodemailer.createTransport(smtpConfig);

exports.send = async function (to,subject,html){
    return new Promise(function (resolve,reject){
        transporter.sendMail({
          from: 'gagik787@gmail.com',
          to: to,
          subject: subject,
          html: html,
        },(err,info)=>{ 
            if(err) reject({error:err});
            else resolve({info:info});
        });
    })
}*/



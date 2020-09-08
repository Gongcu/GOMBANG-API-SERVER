const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const request = require('request');
var appDir = path.dirname(require.main.filename);

//하이퍼링크로 인증하기
router.get('/mail/:student_number',async(req,res)=>{
    console.log('인증완료');
    res.send('인증완료');
});

router.post('/mail', async(req, res) => {
    let authNum = Math.random().toString().substr(2,6);
    //let authurl = "http://localhost:3000/auth/mail/"+req.body.mail;
    let emailTemplete;
    ejs.renderFile(appDir+'/template/authMail.ejs', {authCode : authNum}, function (err, data) {
      if(err){console.log(err)}
      emailTemplete = data;
    });

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
        },
    });

    let mailOptions = await transporter.sendMail({
        from: `곰방`,
        to: req.body.mail,
        subject: '회원가입을 위한 인증번호를 입력해주세요.',
        html: emailTemplete,
    });


    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        console.log("Finish sending email : " + info.response);
        res.send(authNum);
        transporter.close()
    });
});

module.exports=router;
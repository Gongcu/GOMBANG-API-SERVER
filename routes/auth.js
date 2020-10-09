const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const User = require('../models/user');
const updateRow = require('../etc/updateRow');
var appDir = path.dirname(require.main.filename);

//POSTMAN: 토큰갱신@
router.patch('/token',async(req,res,next)=>{
    try{
        const result = await User.update({
           token:req.body.token},
           {
            where:{kakaoId:req.body.kakaoId}
        });
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.get('/mail/:studentNumber', async(req, res) => {
    const emailAddress=req.params.studentNumber+'@dankook.ac.kr';
    const authNum = Math.random().toString().substr(2,6);

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
        to: emailAddress,
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
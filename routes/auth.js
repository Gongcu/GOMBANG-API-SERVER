const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const User = require('../schemas/user')
var appDir = path.dirname(require.main.filename);

router.get('/login',async(req,res,next)=>{
    try{
        const user = await User.find({kakaoId:req.body.kakaoId});
        if(user.length!==0){
            await User.updateOne({kakaoId:req.body.kakaoId},{token:req.body.token})
            res.send('true');
        }else{
            res.send('false');
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/mail/:studentNumber', async(req, res) => {
    const emailAddress=req.params.studentNumber+'@dankook.ac.kr';
    const authNum = Math.random().toString().substr(2,6);
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

/**
 * @swagger
 *  /auth/mail/{_studentNumber}:
 *    get:
 *      tags:
 *      - auth
 *      summary: 학번에 해당하는 메일로 인증번호를 전송한다.
 *      description: 학번에 해당하는 메일로 인증번호를 전송한다.
 *      produces:
 *      - applicaion/json
 *      responses:
 *       200:
 *        description: 조회 성공
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example: Finish sending email
 */


module.exports=router;
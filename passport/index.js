const passport = require('passport');
const kakao = require('./kakaoStrategy');
const User = require('../schemas/user');

module.exports = () =>{
    passport.serializeUser((user,done)=>{
        done(null, user.id)
    });

    passport.deserializeUser((id,done)=>{
        User.findOne({_id:id}).then(user => done(null,user)).catch(err => done(err));
    });
    kakao();
};


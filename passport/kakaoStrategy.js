const passport = require('passport');
const kakaoStrategy = require('passport-kakao').Strategy;

const User = require('../schemas/user');

module.exports = () =>{
    passport.use(new kakaoStrategy({
        clientID:process.env.KAKAO_ID,
        callbackURL:'/auth/kakao/callback'
    }, async(accessToken, refreshToken, profile, done)=>{
        console.log('kakao profile', profile);
        try{
            const exUser = await User.findOne({uid:profile.id});
            if(exUser)
                done(null, exUser);
            else{
                const newUser = await User.create({
                   eamil:profile._json && profile._json.kacount_email,
                   name:profile.displayName,
                   uid:profile.id, 
                });
                done(null, newUser);
            }
        }catch(error){
            console.log(error);
            done(error);
        }
    }));
};
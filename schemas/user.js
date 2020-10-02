const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;

const userSchema = new Schema({
    kakaoId:{
        type: String,
        required:true
    },
    token:{
        type: String,
        default: ""
    },
    login:{
        type: Boolean,
        default: true
    },
    name:{
        type: String,
        default: ""
    },
    image:{
        type: String,
        default:"",
    },
    email:{
        type: String,
        default: ""
    },
    phone:{
        type: String,
        default: ""
    },
    birth:{
        type: String,
        default: ""
    },
    student_number:{
        type: String,
        default: ""
    },
    campus:{
        type: String,
        default: ""
    },
    college:{
        type: String,
        default: ""
    },
    department:{
        type: String,
        default: ""
    },
    signed_club_list:[
        {
            type:ObjectId,
            ref:"Club"
        }
    ],
    favorite_club_list:[
        {
            type:ObjectId,
            ref:"Club"
        }
    ],
    alarm_club_list:[//동아리 설정
        {
            type:ObjectId,
            ref:"Club"
        }
    ],
},{strict:false});


module.exports = mongoose.model('User', userSchema,'user');

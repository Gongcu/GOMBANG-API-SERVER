const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const userSchema = new Schema({
    name:{
        type: String,
    },
    image:{
        type: String,
        default:"",
    },
    token:{
        type: String,
    },
    email:{
        type: String,
    },
    email_certification:{
        type:Boolean,
    },
    kakaoId:{
        type: String,
        required:true
    },
    birth:{
        type: String,
    },
    phone:{
        type: String,
    },
    student_number:{
        type: Number,
    },
    nickname:{
        type:Map,
        of:String,
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
    certification:[
        {
            type:Boolean,
            default:false
        }
    ],
},{strict:false});

module.exports = mongoose.model('User', userSchema,'user');

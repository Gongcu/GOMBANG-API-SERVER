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
    },
    login:{
        type: Boolean,
    },
    name:{
        type: String,
    },
    image:{
        type: String,
        default:"",
    },
    email:{
        type: String,
    },
    phone:{
        type: String,
    },
    birth:{
        type: String,
    },
    student_number:{
        type: Number,
    },
    college:{
        type: String,
    },
    department:{
        type: String,
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
},{strict:false});

module.exports = mongoose.model('User', userSchema,'user');

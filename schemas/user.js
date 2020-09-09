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
    login:{
        type: Boolean,
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

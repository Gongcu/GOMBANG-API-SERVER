const mongoose = require('mongoose');
const formatDateTime = require('../etc/formatDateTime.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const postSchema = new Schema({
    writer_uid:{
        type: ObjectId,
        ref:'User',
        required: true,
    },
    club_id:{
        type: ObjectId,
        ref:'Club',
        required: true,
    },
    isNotice:{
        type: Boolean,
        default: false
    },
    text:{
        type:String,
        required:true,
    },
    image:[
        {
        type: String,
        }
    ],
    file:[
        {
        type: String,
        }
    ],
    video:[
        {
        type: String,
        }
    ],
    like_uid_list:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    participation_fee:{
        type:Number,
        default:0,
    },
    participation_uid_list:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    paid_uid_list:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    comment_id_list:[
        {
            type:ObjectId,
            ref:"Comment"
        }
    ],
    //below fields related calendar
    title:{
        type:String,
        default:"",
    },
    color:{
        type:String,
        default:"",
    },
    startDate:{
        type:String,
        default:"",
    },
    endDate:{
        type:String,
        default:"",
    },
    place:{
        type:String,
        default:"",
    },
    memo:{
        type:String,
        default:"",
    },
    createdAt:{
        type:String,
        default:formatDateTime(Date()),
    }
},{strict:false});

module.exports = mongoose.model('Post', postSchema,'post');

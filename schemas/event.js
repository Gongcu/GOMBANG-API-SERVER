const mongoose = require('mongoose');
const formatDateTime = require('../etc/formatDateTime.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const eventSchema = new Schema({
    host_uid:{
        type: ObjectId,
        ref:'User',
        required: true,
    },
    host_club_id:{
        type: ObjectId,
        ref:'Club',
    },
    text:{
        type:String,
        required:true,
    },
    banner:{
        type: String,
        required:true,
    },
    image:{
        type: String,
    },
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
    comment_id_list:[ //댓글 목록
        {
            type:ObjectId,
            ref:"Comment"
        }
    ],
    title:{
        type:String,
    },
    color:{
        type:String,
    },
    startDate:{
        type:String,
    },
    endDate:{
        type:String,
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

module.exports = mongoose.model('Event', eventSchema,'event');

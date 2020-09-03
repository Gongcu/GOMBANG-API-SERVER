const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const eventSchema = new Schema({
    host_id:{
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
    like_count:{
        type:Number,
        default:0,
    },
    liker_id_list:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    participation_fee:{
        type:Number,
        default:0,
    },
    participation_count:{
        type:Number,
        default:0,
    },
    participation_id_list:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    paid_id_list:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    comment_count:{
        type:Number,
        default:0,
    },
    comment_id_list:[
        {
            type:ObjectId,
            ref:"User"
        }
    ],
    event_title:{
        type:String,
    },
    event_start_day:{
        type:String,
    },
    event_end_day:{
        type:String,
    },
    event_place:{
        type:String,
    },
    event_memo:{
        type:String,
    }
},{strict:false});

module.exports = mongoose.model('Event', eventSchema,'event');

/*
{
    "name": "이지스",
    "image": "http:.....",
    "campus": "죽전",
    "president_uid": "a1233jnb",
    "manager_uid_list":[
        'ba142424f',
        'cd41j223d'
    ],
    "certification": true,
    "type":"중아동아리",
    "exposure":false,
    "classification":"학술",
    "member_count": 100,
    "member_uid_list":[
        'vi124fasd',
        'f42kalsjd',
        ...
    ],
    "recruitment": true,
}*/
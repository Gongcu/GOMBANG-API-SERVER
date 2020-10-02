const mongoose = require('mongoose');

const {Schema} = mongoose;
const clubSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
    },
    campus:{
        type: String,
        required: true,
    },
    text:{
        type: String,
    },
    nickname_rule:{
        type: String,
    },
    president_uid:{
        type: String,
        required: true,
    },
    manager_uid_list:[
        {
            type:Schema.ObjectId,
            ref:"User"
        }
    ],
    certification:{
        type: Boolean,
        default: false,
    },
    type:{
        type: String,
        default:"",
    },
    classification:{
        type: String,
        default: "",
    },
    membership_fee:{
        type: Number,
        default: 0,
    },
    member_count:{
        type: Number,
        default: 0,
    },
    member_uid_list:[
        {
            type:Schema.ObjectId,
            ref:"User"
        }
    ],
    used_nickname_list:[
        {
            uid:String,
            nickname:String,
        }
    ],
    recruitment:{
        type:Boolean,
        default:false,
    },
    exposure:{
        type:Boolean,
        default:true,
    },
    hashtags:[
        {
            type:String
        }
    ]
},{strict:false});

module.exports = mongoose.model('Club', clubSchema,'club');

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
    president_uid:{
        type: String,
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
    },
    classification:{
        type: String,
        default: "",
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
    recruitment:{
        type:Boolean,
        default:false
    }    
},{strict:false});

module.exports = mongoose.model('Club', clubSchema,'club');

/*
{
    "name": "이지스",
    "image": "http:.....",
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
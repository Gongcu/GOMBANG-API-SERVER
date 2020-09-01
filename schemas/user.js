const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const userSchema = new Schema({
    name:{
        type: String,
    },
    profile:{
        type: String,
    },
    email:{
        type: String,
    },
    uid:{
        type: String,
        required:true
    },
    birthday:{
        type: String
    },
    phone:{
        type: String
    },
    student_number:{
        type: Number
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
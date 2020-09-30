const mongoose = require('mongoose');
const formatDateTime = require('../etc/formatDateTime.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const chatSchema = new Schema({
    chatroom_id:{
        type: ObjectId,
        ref: 'Chatroom',
        required: true,
    },
    uid:{
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    message:{
        type: String,
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
    contact:[
        {
        type: String,
        }
    ],
    //메시지 읽지 않은 사람 - 점멸등 표시
    unread_uid_list:[
        {
            type:ObjectId,
            ref:'User'
        }
    ],
    createdAt:{
        type:String,
        default:formatDateTime(Date()),
    }
},{strict:false});

module.exports = mongoose.model('Chat', chatSchema,'chat');

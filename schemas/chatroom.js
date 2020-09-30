const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const chatroomSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    club_id:{
        type: ObjectId,
        ref:'Club',
        required: true,
    },
    participation_uid_list:[
        {
            type:ObjectId,
            ref:'User'
        }
    ],
},{strict:false});

module.exports = mongoose.model('Chatroom', chatroomSchema,'chatroom');

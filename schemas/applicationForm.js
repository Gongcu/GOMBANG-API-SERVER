const mongoose = require('mongoose');
const formatDateTime = require('../etc/formatDateTime.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const applicationFormSchema = new Schema({
    club_id:{
        type: ObjectId,
        ref: 'Club',
        required: true,
    },
    uid:{
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    nickname:{
        type: String,
        required: true,
    },
    gender:{
        type: String,
    },
    birth:{
        type: String,
    },
    campus:{
        type: String,
    }
    ,
    college:{
        type: String,
    },
    department:{
        type: String,
    },
    student_number:{
        type:String,
    },
    phone:{
        type:String,
    },
    residence:{
        type:String,
    },
    experience:{
        type:String,
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:String,
        default:formatDateTime(Date())
    }
},{strict:false});

module.exports = mongoose.model('ApplicationForm', applicationFormSchema,'applicationform');

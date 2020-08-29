const express = require('express');
const multer = require('multer');
const path = require('path');
const uploader = multer({
    storage: multer.diskStorage({
        destination(req,file,cb){
            cb(null, 'upload/');
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname,ext)+Date.now()+ext);
        }
    }),
    limits: {fileSize: 5*1024*1024},
});

const mysql = require("mysql");
const dbConfig = require('../config/database.js');
const connection = mysql.createConnection(dbConfig);
const bodyParser = require('body-parser');

const fs = require('fs');

//저장될 파일명 변경
//https://velog.io/@josworks27/2020-01-18-0001-%EC%9E%91%EC%84%B1%EB%90%A8-qrk5iamlmv
const router = express.Router();

router.use(bodyParser.json());

connection.connect();

//uploader.single('이름'), 해당 하는 이름으로 파일을 전달 받음 //여러 파일 업로드하고 싶다면 single -> array
router.post('/', uploader.single('img'), (req, res, next) => {
    //req.file은 팡리 정보
    //text 정보는 req.body가 포함
    connection.query('INSERT INTO posts(img) VALUE (\'' + req.file.filename + '\')', (error, rows) => {
        if (error) {
            fs.unlink('/upload/${req.file.filename}', (err) => {
                console.log('file upload error:file unlink');
            });
            throw error;
        }else{
            res.send(rows);
        }
    });
});

router.get('/',(req,res)=>{
    connection.query('SELECT * FROM posts', (error, rows)=>{
        if(error){
            res.send("cannot access db");
            throw error;
        }else{
            res.send(rows);
        }
    })
});

module.exports = router;
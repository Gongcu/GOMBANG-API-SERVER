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

var appDir = path.dirname(require.main.filename);

//저장될 파일명 변경
//https://velog.io/@josworks27/2020-01-18-0001-%EC%9E%91%EC%84%B1%EB%90%A8-qrk5iamlmv
const router = express.Router();

router.use(bodyParser.json());

connection.connect();

//uploader.single('이름'), 해당 하는 이름으로 파일을 전달 받음 //여러 파일 업로드하고 싶다면 single -> array
router.post('/', uploader.single('img'), (req, res, next) => {
    //req.file은 팡리 정보
    //text 정보는 req.body가 포함
    connection.query('INSERT INTO clubs(c_name,c_image) VALUE (\''+req.body.c_name+'\',\'' + req.file.filename + '\')', (error, rows) => {
        if (error) {
            fs.unlink('/upload/req.file.filename}', (err) => {
                console.log('file upload error:file unlink');
            });
            throw error;
        }else{
            res.send(req.file.filename);
        }
    });
});

router.get('/:c_name',(req,res)=>{
    connection.query('SELECT * FROM clubs WHERE c_name=\''+req.params.c_name+'\'', (error, rows)=>{
        if(error) console.log(error);
        fs.readFile(appDir+'/upload/'+rows[0].c_image, (err, data)=>{
            if(err){
                throw err;
            }
            res.writeHead(200, {'Content-Type':'image/png'})
            res.write(data);
            res.end();
        });
    })
});



router.get('/',(req,res)=>{
    console.log(appDir);
    connection.query('SELECT * FROM clubs', (error, rows)=>{
        if(error){
            res.send("cannot access db");
            throw error;
        }else{
            res.send(rows);
        }
    })
});

module.exports = router;
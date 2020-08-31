const express = require('express');
const Club = require('../schemas/club');
const bodyParser = require('body-parser');
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
const fs = require('fs');
var appDir = path.dirname(require.main.filename);

const router = express.Router();

router.get('/',async(req,res,next)=>{
    try{
        const club = await Club.find({});
        res.send(club);
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:name',async(req,res,next)=>{
    try{
        const club = await Club.find({name:req.params.name});
        res.send(club);
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/image/:filename',async(req,res)=>{
    fs.readFile(appDir+'/upload/'+req.params.filename, (err, data)=>{
        if(err){
            throw err;
        }
        res.writeHead(200, {'Content-Type':'image/png'})
        res.write(data);
        res.end();
    });
});

router.post('/',uploader.single('image'),async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        const club = await Club.create({
            name: body.name,
            image: req.file.filename,
            campus: req.body.campus,
            president_uid: body.president_uid,
            member_uid_list: body.member_uid_list,
            certification: body.certification,
            type:body.type,
            classification:body.classification,
            membership_fee:body.membership_fee,
            member_count:body.member_count,
            member_uid_list:body.member_uid_list,
            recruitment:body.recruitment
        });
        res.send(club);
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:name',async(req,res,next)=>{
    try{
        const obj = await Club.findOne({name:req.params.name});
        const club = await Club.remove({name:req.params.name});
        const filename = obj.image;
        fs.unlink(appDir+'/upload/'+filename, (err) => {
            console.log(err);
        });
        res.send(club);
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});


/*const express = require('express');
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
*/
module.exports = router;
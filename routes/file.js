const express = require('express');
const path = require('path');

const fs = require('fs');
var appDir = path.dirname(require.main.filename);

const router = express.Router();

router.get('/video/:filename',(req,res)=>{
    fs.readFile(appDir+'/upload/'+req.params.filename, (err, data)=>{
        if(err){
            throw err;
        }
        res.writeHead(200, {'Content-Type':'video/mp4'})
        res.write(data);
        res.end();
    });
});

router.get('/download/:filename',(req,res)=>{
    fs.readFile(appDir+'/excel/'+req.params.filename, (err, data)=>{
        if(err){
            throw err;
        }
        res.writeHead(200, {'Content-Type':'application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8'});
        res.enco
        res.write(data);
        res.end();
    });
});


module.exports = router;
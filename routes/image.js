const express = require('express');
const path = require('path');

const fs = require('fs');
var appDir = path.dirname(require.main.filename);

const router = express.Router();

router.get('/:filename',(req,res)=>{
    fs.readFile(appDir+'/upload/'+req.params.filename, (err, data)=>{
        if(err){
            throw err;
        }
        res.writeHead(200, {'Content-Type':'image/png'})
        res.write(data);
        res.end();
    });
});



module.exports = router;
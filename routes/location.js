const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const dbConfig = require('../config/database.js');
const connection = mysql.createConnection(dbConfig);
const bodyParser = require('body-parser');

connection.connect();

router.use(bodyParser.json());

router.get('/',(req,res)=>{
    connection.query('SELECT * FROM location', (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows);
    });
});

router.get("/accident",(req,res)=>{
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const sql =`SELECT token,`
    +`(6371*acos(cos(radians(${latitude}))*cos(radians(latitude))*cos(radians(longitude)-radians(${longitude}))`
    +`+sin(radians(${latitude}))*sin(radians(latitude)))) AS distance `
    //+'WHERE token <>: req.body.token'
    +`FROM location `
    +`HAVING distance < 1 ORDER BY distance`;
    connection.query(sql, (error,rows)=>{
        if(error) throw error;
        res.send(rows);
    });
});


router.get("/:token",(req,res)=>{
    connection.query('SELECT * FROM location WHERE token=\''+req.params.token+'\'', (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows)
    });
});



//?를 사용하면 query 함수에서 전달받은 params를 매핑해줌
router.post("/",(req,res)=>{
    var selectQuery = 'SELECT * FROM location WHERE token=\''+req.body.token+'\''
    var insertQuery = 'INSERT INTO location VALUES (?,?,?,?)';
    var updateQuery =  'UPDATE location SET latitude='+req.body.latitude+', longitude='+req.body.longitude+', bearing='+req.body.bearing+
    ' WHERE token=\''+req.body.token+"\'";
    var params = [req.body.token,req.body.latitude, req.body.longitude,req.body.bearing];

    connection.query(selectQuery, (error,rows)=>{
        if(rows===undefined){
            connection.query(insertQuery,params,(error,rows)=>{
                if(error) throw error;
                res.send(rows);
            });
        }else{
            connection.query(updateQuery,(error,rows)=>{
                if(error) throw error;
                res.send(rows);
            });
        }
    })
})




router.delete("/",(req,res)=>{
    var sql = 'DELETE FROM location WHERE token=\''+req.body.token+'\'';
    connection.query(sql, (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows);
    });
})

module.exports = router;
const express = require("express");
const mysql = require("mysql");
const dbConfig = require("./config/database.js");
const connection = mysql.createConnection(dbConfig);
const bodyParser = require("body-parser");

const server = express();

server.use(bodyParser.json())

server.get("/location",(req,res)=>{
    connection.query('SELECT * FROM location', (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows);
    });
});


server.get("/location/:token",(req,res)=>{
    connection.query('SELECT * FROM location WHERE token=\''+req.params.token+'\'', (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows)
    });
});

//?를 사용하면 query 함수에서 전달받은 params를 매핑해줌
server.post("/location",(req,res)=>{
    var sql = 'INSERT INTO location VALUES (?,?,?)';
    var params = [req.body.token,req.body.latitude, req.body.longitude];
    connection.query(sql, params, (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows);
    });
})


//url로 id를 전달해주고 body에 바꾸고 싶은 필드를 적으면 업데이트됨
server.put("/location/:token",(req,res)=>{
    var sql = 'UPDATE location SET latitude='+req.body.latitude+', longitude='+req.body.longitude+' WHERE token=\''+req.params.token+"\'";
    connection.query(sql, (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows);
    });
})

server.delete("/location/:token",(req,res)=>{
    var sql = 'DELETE FROM location WHERE token=\''+req.params.token+'\'';
    connection.query(sql, (error, rows)=>{
        if(error) throw error;
        console.log('Location info is: ', rows);
        res.send(rows);
    });
})

server.listen(3000, ()=>{
    console.log("the server is running")
})


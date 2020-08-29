const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const dbConfig = require('../config/database.js');
const connection = mysql.createConnection(dbConfig);
const bodyParser = require('body-parser');

connection.connect();

router.use(bodyParser.json());

router.get('/',(req,res)=>{
    connection.query('SELECT * FROM user', (error, rows)=>{
        if(error) throw error;
        console.log('user info is: ', rows);
        res.send(rows);
    });
});


router.get("/:id",(req,res)=>{
    connection.query('SELECT * FROM user WHERE id=\''+req.params.id+'\'', (error, rows)=>{
        if(error) throw error;
        console.log('user info is: ', rows);
        res.send(rows)
    });
});

module.exports = router;
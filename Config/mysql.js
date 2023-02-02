const mysql = require("mysql");

//create mysql connection
const CNX = mysql.createConnection({
       
    host : 'tabibcom.c3e95rou1qgl.us-east-1.rds.amazonaws.com',
    user : 'admin', 
    password : 'amouna**91',
    database : 'doccare'

})

//connect to dababase
CNX.connect((err,res)=>{

if(err) throw err
console.log("my sql is runing")

})

exports.DB = CNX;


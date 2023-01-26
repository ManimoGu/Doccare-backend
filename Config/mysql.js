const mysql = require("mysql");

//create mysql connection
const CNX = mysql.createConnection({
       
    host : 'sql8.freesqldatabase.com',
    user : 'sql8592743', 
    password : 'nGCG5BNrUp',
    database : 'sql8592743'

})

//connect to dababase
CNX.connect((err,res)=>{

if(err) throw err
console.log("my sql is runing")

})

exports.DB = CNX;


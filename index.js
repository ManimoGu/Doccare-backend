

const express = require("express")
const cors = require("cors")
const {DB} = require('./Config/mysql');
const bodyparser = require("body-parser")
const { register, verify, Signin, resend} = require("./API/auth");

const { API_URL } = require("./config/api");

//create an app 

const app = express();

//enable Listening http server

app.listen("9000", (req, resp) => {
    console.log("Server is runing on port 9000...");
  });

  app.use(bodyparser.urlencoded({extended : true}))

//looks at requests where the content-type : application-json (header).
  app.use(bodyparser.json())

  app.use(cors())

  app.get("/api/auth/register", register);

  app.get("/api/verify-email/:login/code/:token", verify);

  app.get("/api/Signin/:login/pass/:password", Signin);

  app.get("/api/resend/:login/code/:token", resend)
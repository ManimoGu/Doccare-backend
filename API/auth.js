const { mailgun } = require("../Config/email");
const { Doctor } = require("../models/Doctor");
const { Cabinet } = require("../models/Cabinet");
const { Account } = require("../models/Account");
const { SendEmail } = require("../Helpers/Sendemail");
const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Email } = require("../Models/Email");
const bcrypt = require("bcrypt");
const {validationRegister} = require("../Helpers/validation");


exports.register = async (req, resp) => {

  console.log(req.body)
  
  //fetch data
  let newDoctor = new Doctor(
    req.body.nom,
    req.body.prenom,
    req.body.specialite,
    req.body.CIN,
    '',
    req.body.email
  );

  let newCabinet = new Cabinet(
    req.body.adresse,
    req.body.Tel,
    req.body.email
  );

  let newAccount = new Account(req.body.login, req.body.password, "docteur");

  //validation des données

 if (validationRegister(newDoctor, newAccount, newCabinet))
  resp.status(403).json({ message: validationRegister(newDoctor, newAccount, newCabinet) });
  else {
  try {
    let res = await sqlQuery(
      `SELECT *  FROM Account WHERE Login = '${newAccount.login}'`
    );

    console.log(res);

    if (res.length !== 0) {
      if (res[0].ISVERIFIED) {
        resp.status(201).json({ message: "<h1>username already exists</h1>" });
      } else if (!res[0].ISVERIFIED) {
        resp.status(201).json({
          message:
            "<h1>You should verify your account, an mail was sent to your email adress</h1>",
        });
      }
    } else {
      newAccount.isverified = false;
      newAccount.expirationDat = new Date(Date.now() + 24 * 60 * 60 * 1000);
      newAccount.token = randomstring.generate({
        length: 4,
        charset: "numeric",
      });

      //create de endpoint of the api
      let endpoint = `http://localhost:9000/api/verify-email/${newAccount.login}/code/${newAccount.token}`;

      //send the mail

      let userInfo = new Email(
        "imane@support.com",
        newCabinet.email,
        "email verification ✔",
        `<h1>thanks for your registration</h1>
            Click the link below to verify your email
            <a href=${endpoint}>Verify</a>
            the link will be expired after 24 hours 
            `,
        endpoint
      );

      //insert user

      let result = await bcrypt.hash(newAccount.password, 10);
      newAccount.password = result;

      console.log(newAccount);

      let query = `INSERT INTO Account Set ?`;
      let query1 = `INSERT INTO Cabinet Set ?`;
      let query2 = `INSERT INTO Doctor Set ?`;

      if (sqlQuery(query, newAccount) && sqlQuery(query1, newCabinet)) {
        let res = await sqlQuery(`SELECT * FROM Account `);
        let result = await sqlQuery(`SELECT * FROM Cabinet `);

        newDoctor.Cabinet = result[result.length - 1].Id;
        newDoctor.Account = res[res.length - 1].Id;

        if (sqlQuery(query2, newDoctor)) {
          SendEmail(userInfo);
        }

        console.log(newDoctor);
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}
};

exports.verify = async (Req, Resp) => {
  let login = Req.params.login;
  let Token = Req.params.token;

  let res = await sqlQuery(
    `SELECT  ExpirationDat FROM Account WHERE Login ='${login}' and Token='${Token}' `
  );

  if (res.length === 0) {
    Resp.status(201).json({ message: "Token or login are unvalid" });
  } else {
    if (Date.now() > res[0].ExpirationDat) {
      let link = `http://localhost:9000/api/resend/${login}/code/${Token}`;

      Resp.send(`
             
             <h1>This link has already expired</h1>
             <h5>Click on <a href= ${link}> resend </a>to get a valid link </h5>       
             `);
    } else {
      let rest = await sqlQuery(
        `UPDATE Account SET Isverified = "1" , Token = "" WHERE Login ='${login}'`
      );

      Resp.send(`
          
             <h1>You account has been verified</h1>
             <a href= "http://localhost:3000/Login">Login in</a>
             
             `);
    }
  }
};

exports.resend = async (Req, Resp) => {
  let login = Req.params.login;
  let Token = Req.params.token;

  let res = await sqlQuery(
    `SELECT  id, ExpirationDat, Fonction FROM Account WHERE Login ='${login}' and Token='${Token}' `
  );

  if (res.length === 0) {
    Resp.send("<h1>The account doesn't exists</h1>");
  } else {
    let date = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    //create de endpoint of the api

    let endpoint = `http://localhost:9000/api/verify-email/${login}/code/${Token}`;

    // Get the email from the database

    let email = "";
    let fonction = "";

    if (res[0].Fonction === "Docteur") {
      fonction = "Docteur";
    } else if (res[0].Fonction === "Assistante") {
      fonction = "Assistante";
    } else {
      fonction = "Patient";
    }

    let mail = await sqlQuery(
      `Select Email from ${fonction} where Account = ${res[0].Id}`
    );

    //send the mail
    let userInfo = new Email(
      "imane@support.com",

      mail[0].Email,
      "email verification ✔",
      `<h1>thanks for your registration</h1>
    Click the link below to verify your email
    <a href=${endpoint}>Verify</a>
    the link will be expired after 24 hours 
    `,
      endpoint
    );

    if (
      sqlQuery(
        `UPDATE Account SET  ExpirationDat = '${date}' WHERE Login ='${login}'`
      )
    ) {
      SendEmail(userInfo);

      Resp.send("<h1> Check your email to verify your account </h1>");
    }
  }
};

exports.Signin = async (Req, Resp) => {
  let login = Req.params.login;
  let pass = Req.params.password;

  let res = await sqlQuery(` Select * from Account where Login = '${login}'`);

  if (res.length === 0) {
    Resp.status(201).json({ message: "Invalid Email" });
  } else {
    bcrypt.compare(pass, res[0].Password, (err, result) => {

      if (!result) Resp.status(201).json({ message: "Incorrect password" });
      else {
        Resp.status(201).json({ message: "You are loged in" });
      }
    });
  }
};

exports.forgot = async (Req, Resp) => {

  // get the login from the url defined in the frontend
  let login = Req.params.login;

  
  let res = await sqlQuery(
    `SELECT Fonction, Isverified FROM Account WHERE Login ='${login}'`
  );

   //verify if the login exist in teh data base

  if (res.length === 0) {
    Resp.status(201).json({ message: "Login not found" });
  } else {

    // See if the account is verified or not 

    if (!res[0].ISVERIFIED) {
      Resp.status(201).json({ message: "You account is not verified" });
    } else {

      let date = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      let token = randomstring.generate();

      //create the redirected link to the frontend page
      let endpoint = `http://localhost:3000/ResetPass/${login}/code/${token}`;

      // Get the email from the database

      let fonction = "";
  
      if (res[0].Fonction === "Docteur") {
        fonction = "Docteur";
      } else if (res[0].Fonction === "Assistante") {
        fonction = "Assistante";
      } else {
        fonction = "Patient";
      }
  
      let mail = await sqlQuery(
        `Select Email from ${fonction} where Account = ${res[0].Id}`
      );

      //send the mail

      let userinfo = new Email(
        " <support.imane@gmail.com>",
        mail[0].Email,
        "Reset your password ✔",
        `<h1>You requested to reset your password</h1>
           Click the link below to change the password
          (<a href=${endpoint}>reset password</a>)
           the link will be expired after 24 hours 
           `,
        endpoint
      );

      if (
        sqlQuery(
          ` UPDATE Account SET Token = '${token}', ExpirationDat = '${date}'  WHERE Login ='${login}'`
        )
      ) {
        SendEmail(userinfo);

        Resp.send(`
           
           <h1> Please check your email  </h1>
           
           `);
      }
    }
  }
};

exports.resetPass = async(Req, Resp)=>{

  let login = Req.params.login;
  let Token = Req.params.token;

  let pass = Req.body

  console.log(pass)

  let res = await sqlQuery(`SELECT  ExpirationDat FROM Account WHERE Login ='${login}' and TOKEN='${Token}' `)

        if(res.length === 0){

          Resp.status(201).json({message :"Invalid Token"})
          
        }else{

          if(res[0].ExpirationDat < Date.now()){

            let link = `http://localhost:9000/api/resend/${login}/code/${Token}`

            Resp.send(`
           
            <h1>This link has already expired</h1>
            <h5>Click on <a href=${link}> resend </a>to get a valid link </h5>       
            `)     

          }else {

            let result = await bcrypt.hash(pass.password, 10)

          if (sqlQuery(`UPDATE Account SET Password = '${result}' WHERE Login ='${login}'`))
         
          Resp.send(`
           
          <h1> Password changed successfully </h1>
          <a href= "http://localhost:3000/Login">Login in to your account</a>
          
          `)     


        }

        }


}



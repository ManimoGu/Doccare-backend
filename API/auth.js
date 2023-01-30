
const { Doctor } = require("../moduls/Doctor");
const { Cabinet } = require("../moduls/Cabinet");
const { Account } = require("../moduls/Account");
const { SendEmail } = require("../Helpers/Sendemail");
const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Email } = require("../moduls/Email");
const bcrypt = require("bcryptjs");
const { validationRegister } = require("../Helpers/validation");
const fs = require("fs");

exports.register = async (req, resp) => {
  //fetch data
  let newDoctor = new Doctor(
    req.body.Nom,
    req.body.Prénom,
    req.body.Spécialité,
    req.body.CIN,
    "",
    req.body.Email
  );

  let newCabinet = new Cabinet(req.body.Adresse, req.body.Tel, req.body.Email);

  let newAccount = new Account(req.body.Login, req.body.Password, "docteur");

  //validation des données

  if (validationRegister(newDoctor, newAccount, newCabinet))
    resp
      .status(403)
      .json({ message: validationRegister(newDoctor, newAccount, newCabinet) });
  else {
    try {
      let res = await sqlQuery(
        `SELECT *  FROM Account WHERE Login = '${newAccount.login}'`
      );

      console.log(res);

      if (res.length !== 0) {
        if (res[0].ISVERIFIED) {
          resp.status(201).json({ message: "Nom d'utilisateur déja existant" });
        } else if (!res[0].ISVERIFIED) {
          resp.status(201).json({
            message:
              "Vous devez vérifier votre compte, un email vous a déja été envoyé sur votre adresse",
          });
        }
      } else {
        let res = await sqlQuery(
          `SELECT *  FROM cabinet  WHERE Email = '${newCabinet.email}'`
        );

        if (res.length !== 0) {
          resp
            .status(201)
            .json({ message: "Cet email est déja associé à un autre cabinet" });
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

          let result = await bcrypt.hashSync(newAccount.password, 10);
          newAccount.password = result;

          console.log(newAccount);

          let query = `INSERT INTO Account Set ?`;
          let query1 = `INSERT INTO Cabinet Set ?`;
          let query2 = `INSERT INTO Docteur Set ?`;

          //let res = await sqlQuery(query, newAccount);

          if (sqlQuery(query, newAccount) && sqlQuery(query1, newCabinet)) {
            let res = await sqlQuery(`SELECT * FROM Account `);
            let result = await sqlQuery(`SELECT * FROM Cabinet `);

            newDoctor.Cabinet = result[result.length - 1].Id;
            newDoctor.Account = res[res.length - 1].Id;
            console.log(newDoctor);

            if (sqlQuery(query2, newDoctor)) {
              SendEmail(userInfo);
              console.log("hello");
            }

            console.log(newDoctor);
          }
        }
      }
    } catch (err) {
      console.log(err.message);
      resp.send(err.message);
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
    Resp.status(201).json({ message: "Token ou nom d'utilisateur invalides" });
  } else {
    if (Date.now() > res[0].ExpirationDat) {
      let link = `http://localhost:9000/api/resend/${login}/code/${Token}`;

      Resp.send(`
             
             <h1>Ce lien a déja expiré</h1>
             <h5>Cliquez sur <a href= ${link}> renvoyer </a>pour avoir un nouveau lien valide </h5>       
             `);
    } else {
      let rest = await sqlQuery(
        `UPDATE Account SET Isverified = "1" , Token = "" WHERE Login ='${login}'`
      );

      Resp.send(`
          
             <h1>Votre compte a été vérifier avec succés</h1>
             <a href= "http://localhost:3000/Signin">se connceter</a>
             
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
    Resp.send("<h1>ce compte existe déja</h1>");
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

      Resp.send("<h1> Vérifier votre email pour valider votre compte </h1>");
    }
  }
};

exports.Signin = async (Req, Resp) => {
  let login = Req.params.login;
  let pass = Req.params.password;

  let res = await sqlQuery(` Select * from Account where Login = '${login}'`);

  if (res.length === 0) {
    Resp.status(201).json({ message: "Nom d'utilisqteur invalide" });
  } else {
    console.log("hello");
    bcrypt.compare(pass, res[0].Password, (err, result) => {
      if (!result) Resp.status(201).json({ message: "Mot de passe incorrect" });
      else {
        Resp.status(201).json({ message: "Vous êtes connecté" });
      }
    });
  }
};

exports.forgot = async (Req, Resp) => {
  // get the login from the url defined in the frontend
  let login = Req.params.login;

  let res = await sqlQuery(
    `SELECT Id, Fonction, Isverified FROM Account WHERE Login ='${login}'`
  );

  console.log(res);
  //verify if the login exist in teh data base

  if (res.length === 0) {
    Resp.status(201).json({ message: "Nom d'utilisateur introuvable" });
  } else {
    // See if the account is verified or not
    console.log(res[0].Isverified);
    if (!res[0].Isverified) {
      Resp.status(201).json({
        message: "Vous n'avez pas encore vérifier votre compte",
      });
    } else {
      let date = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      let token = randomstring.generate();

      //create the redirected link to the frontend page
      let endpoint = `http://localhost:3000/Resetpassword/${login}/code/${token}`;

      // Get the email from the database
      let mail = await sqlQuery(
        `Select Email from ${res[0].Fonction} where Account = ${res[0].Id}`
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
           
           <h1> Merci de vérifier votre email  </h1>
           
           `);
      }
    }
  }
};

exports.resetPass = async (Req, Resp) => {
  let login = Req.params.login;
  let Token = Req.params.token ? Req.params.token : "";

  let pass = Req.body;

  console.log(pass);

  let res = await sqlQuery(
    `SELECT  ExpirationDat FROM Account WHERE Login ='${login}' and TOKEN='${Token}' `
  );

  if (res.length === 0) {
    Resp.status(201).json({ message: "Token Invalid " });
  } else {
    if (res[0].ExpirationDat < Date.now()) {
      let link = `http://localhost:9000/api/resend/${login}/code/${Token}`;

      Resp.send(`
           
            <h1>Ce lien est déja expiré</h1>
            <h5>Cliquer sur <a href=${link}> renvoyer </a>pour avoir un nouveau email valide </h5>       
            `);
    } else {
      let result = await bcrypt.hashSync(pass.password, 10);

      if (
        sqlQuery(
          `UPDATE Account SET Password = '${result}' WHERE Login ='${login}'`
        )
      )
        Resp.send(`
           
          <h1> Votre mot de passe a été changer avec succés </h1>
          <a href= "http://localhost:3000/Login">Connectez vous</a>
          
          `);
    }
  }
};

exports.reseSettingtPass = async (req, Resp) => {
  let login = req.params.login;
  let Password = req.params.password;
  let id = req.user;
  let Cab = req.ID;

  let PassInfos = req.body;

  try {
    if (id !== Cab)
      Resp.status(201).json({
        message: "Vous ne pouvez effectuer cette operation",
      });
    else {
      let res = await sqlQuery(
        `SELECT  Password FROM Account WHERE Login ='${login}' `
      );

      let result = await bcrypt.compareSync(Password, res[0].Password);

      if (!result) {
        Resp.status(201).json({ message: "Mot de passe invalide" });
      } else {
        let resul = await bcrypt.hashSync(PassInfos.password, 10);

        if (
          sqlQuery(
            `UPDATE Account SET Password = '${resul}' WHERE Login ='${login}'`
          )
        )
          Resp.send(`
           
          <h1> Votre mot de passe a été changer avec succés </h1>
          <a href= "http://localhost:3000/Login">Connectez vous</a>
          
          `);
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.UploadFile = async (Req, Resp) => {
  let file = Req.files.image;
  let fileName = file.name;
  let id = Req.user;
  let Cab = Req.ID;
  let Nom = Req.params.Nom;
  let Prénom = Req.params.Prenom;
  let type = Req.params.type;

   
  try {
    if (id !== Cab)
      Resp.status(201).json({
        message: "Vous ne pouvez effectuer cette operation",
      });
    else {
      if (!Req.files === null) return Resp.status(400).send("No files");

      // use mv() to store pic on the server

      // let UploadPath = __dirname + "\\Picture\\" + fileName;
      if (type === "Patient")
        var path = __dirname + `\\Ressources\\Patients\\${Nom} ${Prénom}`;
      if (type === "Assistante")
        var path = __dirname + `\\Ressources\\Assistante\\${Nom} ${Prénom}`;
      if (type === "Doctor")
        var path = __dirname + `\\Ressources\\Doctor\\${Nom} ${Prénom}`;

      fs.access(path, (error) => {
        if (error) {
          fs.mkdir(path, (error) => {
            if (error) {
              console.log(error);
            } else {
              console.log("New Directory created successfully !!");
            }
          });
        }
      });

      file.mv(`${path}/${fileName}`, (err) => {
        if (err) {
          return Resp.status(500).send(err);
        }

        Resp.json({ fileName: fileName, filePath: `${path}\\{${fileName}` });
      });
    }
    //if (Resp) Resp.status(200).send("File uploaded");
  } catch (err) {
    console.log(err.message);
  }
};

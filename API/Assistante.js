const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");

const { Account } = require("../models/Account");
const { Assistante } = require("../models/Assistante");
const { Email } = require("../models/Email");
const bcrypt = require("bcryptjs");


exports.AssistanteList = async (req, res) => {
  let Cab = req.params.id;
  let id = req.user;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT * FROM assistante Where Cabinet = '${Cab}'`
      );

      res.status(201).json({
        ListAssistante: resp,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddAssistante = async (req, res) => {
  let Cab = req.params.cabinet;
  let id = req.user;

  let newAssistance = new Assistante(
    req.body.Nom,
    req.body.Prénom,
    req.body.Date_naissance,
    req.body.CIN,
    req.body.Tel,
    req.body.Adresse,
    req.body.Avatar,
    new Date(Date.now()),
    Cab
  );

  let newAccount = new Account(req.body.CIN, req.body.password, "Assistante");

  /*if (validationRegister(newDoctor, newAccount, newCabinet))
    resp
      .status(403)
      .json({ message: validationRegister(newAccount, newAssistance) });
  else {*/
  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT *  FROM Account WHERE Login = '${newAccount.login}'`
      );

      if (resp.length !== 0) {
        if (resp[0].ISVERIFIED) {
          res.status(201).json({ message: "Nom d'utilisateur déja existant" });
        } else if (!resp[0].ISVERIFIED) {
          res.status(201).json({
            message:
              "Vous devez vérifier votre compte, un email vous a déja été envoyé sur votre adresse",
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

        let Mail = await sqlQuery(
          `SELECT Email  FROM cabinet WHERE Id = '${Cab}'`
        );

        //send the mail

        let userInfo = new Email(
          "imane@support.com",
          Mail[0].Email,
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

        let query = `INSERT INTO Account Set ?`;
        let query2 = `INSERT INTO Assistante Set ?`;

        if (sqlQuery(query, newAccount)) {
          let resp = await sqlQuery(`SELECT * FROM Account `);

          newAssistance.Account = resp[res.length - 1].Id;

          if (sqlQuery(query2, newAssistance)) {
            // SendEmail(userInfo);
          }
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.DeleteAssistante = async (req, res) => {
  let IdAssistante = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let resp = await sqlQuery(
        `SELECT Account  FROM Assistante WHERE Id = '${IdAssistante}'`
      );

      if (sqlQuery(`DELETE FROM Assistante WHERE Id ='${IdAssistante}'`)) {
        if (sqlQuery(`DELETE FROM Account WHERE Id ='${resp[0].Account}'`)) {
          res
            .status(201)
            .json({ message: "Le docteur a été supprimer avec succés" });
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.UpdateAssistante = async (req, res) => {
  let IdAssistante = req.params.id;
  let id = req.user;
  let Cab = req.ID;

  let newAssistance = new Assistante(
    req.body.Nom,
    req.body.Prénom,
    req.body.Date_naissance,
    req.body.CIN,
    req.body.Tel,
    req.body.Adresse,
    req.body.Avatar,
    req.body.Entree_le,
    req.body.Cabinet,
    req.body.Account
  );

  try {
    if (id !== Cab)
  
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let query = `UPDATE  Assistante Set ? WHERE id = '${IdAssistante}'`;

      if (sqlQuery(query, newAssistance)) {
        res
          .status(201)
          .json({ message: "Les informations ont été modifier avec succés" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.UpdateAvatarAssistante = async (req, res) => {
  let IdAssistante = req.params.id;
  let Avatar = req.body.file;
  let id = req.user;
  let Cab = req.ID;

  try {
    if (id !== Cab)
      res
        .status(201)
        .json({ message: "Vous ne pouvez effectuer cette operation" });
    else {
      let query = `UPDATE  Assistante Set Avatar = '${Avatar}'  WHERE id = '${IdAssistante}'`;

      if (sqlQuery(query)) {
        res
          .status(201)
          .json({ message: "Votre photo a été changer avec succés" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

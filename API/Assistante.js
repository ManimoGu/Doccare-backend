const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Doctor } = require("../models/Doctor");
const { Cabinet } = require("../models/Cabinet");
const { Account } = require("../models/Account");


exports.AssistanteList = async (req, resp) => {
  try {
    let res = await sqlQuery(`SELECT * FROM assistante`);

    resp.status(201).json({
      ListAssistante: res,
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddAssistante = async (req, resp) => {
  let Cab = req.params.cabinet;

  let newAssistance = new Assistante(
    req.body.nom,
    req.body.prenom,
    req.body.CIN,
    req.body.tel,
    req.body.adresse,
    Cab
  );

  let newAccount = new Account(req.body.login, req.body.password, "Assistante");

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

        console.log(newAccount);

        let query = `INSERT INTO Account Set ?`;
        let query2 = `INSERT INTO Assistante Set ?`;

        if (sqlQuery(query, newAccount)) {
          let res = await sqlQuery(`SELECT * FROM Account `);

          newAssistance.Account = res[res.length - 1].Id;

          if (sqlQuery(query2, newAssistance)) {
            SendEmail(userInfo);
          }

          console.log(newAssistance);
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  }
};

exports.DeleteAssistante = async (req, resp) => {
  let IdAssistante = req.params.id;

  try {
    let res = await sqlQuery(
      `SELECT Account  FROM Assistante WHERE Id = '${IdAssistante}'`
    );

    if (sqlQuery(`DELETE FROM Assistante WHERE Id ='${IdAssistante}'`)) {
      if (sqlQuery(`DELETE FROM Account WHERE Id ='${res[0].Account}'`)) {
        resp
          .status(201)
          .json({ message: "Le docteur a été supprimer avec succés" });
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.UpdateAssistante = async (req, resp) => {

  let IdAssistante = req.params.id;

  let newAssistance = new Assistante(
    req.body.nom,
    req.body.prenom,
    req.body.CIN,
    req.body.tel,
    req.body.adresse
  );

  try {
    if (
       sqlQuery(
        `UPDATE docteur SET Nom = '${newAssistance.nom}', Prénom = '${newAssistance.prénom}', CIN =' ${newAssistance.CIN}', Tel = '${newAssistance.tel}', Adresse = '${newAssistance.adresse}' WHERE Id ='${IdAssistante}'`
      )
    ) {

        resp
          .status(201)
          .json({ message: "Les informations ont été modifier avec succés" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

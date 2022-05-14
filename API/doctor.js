const { sqlQuery } = require("../Helpers/Promise");
const randomstring = require("randomstring");
const { Doctor } = require("../models/Doctor");
const { Cabinet } = require("../models/Cabinet");
const { Account } = require("../models/Account");
const bcrypt = require("bcrypt");

exports.DoctorProfil = async (req, Resp) => {
  let login = req.params.login;
  let pass = req.params.password;

  try {
    let res = await sqlQuery(`SELECT  * FROM Account WHERE Login ='${login}' `);

    if (res.length === 0) {
      Resp.status(201).json({
        message: "Nom d'utilisateur introuvables",
      });
    } else {
      let result = await bcrypt.compare(pass, res[0].Password);
      if (!result) Resp.status(201).json({ message: "Mot de passe incorrect" });
      else {
        let DoctorInfo = await sqlQuery(
          `SELECT  * FROM docteur WHERE Account ='${res[0].Id}' `
        );

        let CabinetInfo = await sqlQuery(
          `SELECT * FROM cabinet WHERE  Id ='${DoctorInfo[0].Cabinet}' `
        );

        if (DoctorInfo.length === 0 && CabinetInfo.length === 0)
          Resp.status(201).json({ message: "Compte introuvable" });
        else {
          console.log("hello");
          Resp.status(201).json({
            infos: {
              Doctor: DoctorInfo,
              AccountInfo: res,
              CabinetInfos: CabinetInfo,
            },
          });
        }
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

exports.AddDoctor = async (req, resp) => {
  let Cab = req.params.cabinet;

  let newDoctor = new Doctor(
    req.body.nom,
    req.body.prenom,
    req.body.specialite,
    req.body.CIN,
    req.body.tel,
    req.body.email
  );

  let newAccount = new Account(req.body.login, req.body.password, "docteur");

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

        //send the mail

        let userInfo = new Email(
          "imane@support.com",
          newDoctor.email,
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
        let query2 = `INSERT INTO Docteur Set ?`;

        if (sqlQuery(query, newAccount)) {
          let res = await sqlQuery(`SELECT * FROM Account `);

          newDoctor.Account = res[res.length - 1].Id;
          newDoctor.Cabinet = Cab;

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

exports.DeleteDoctor = async (req, resp) => {
  let IdDoctor = req.params.id;

  try {
    let res = await sqlQuery(
      `SELECT Account  FROM docteur WHERE Id = '${IdDoctor}'`
    );

    if (sqlQuery(`DELETE FROM docteur WHERE Id ='${IdDoctor}'`)) {
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

exports.UpdateDoctor = async (req, resp) => {
  let IdDoctor = req.params.id;

  let newDoctor = new Doctor(
    req.body.nom,
    req.body.prenom,
    req.body.specialite,
    req.body.CIN,
    req.body.tel,
    req.body.email
  );

  try {
    if (
      sqlQuery(
        `UPDATE docteur SET Nom = '${newDoctor.nom}', Prénom = '${newDoctor.prénom}', Spécialité = '${newDoctor.spécialité}', CIN =' ${newDoctor.CIN}', Tel = '${newDoctor.tel}', Email = '${newDoctor.email}' WHERE Id ='${IdDoctor}'`
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

exports.DoctorList = async (req, resp) => {
  try {
    let res = await sqlQuery(`SELECT * FROM docteur`);

    resp.status(201).json({
      ListDoctor: res,
    });
  } catch (err) {
    console.log(err.message);
  }
};
